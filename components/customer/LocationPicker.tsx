"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapPinIcon, SearchIcon } from "./icons";
import styles from "./LocationPicker.module.css";

export type LocationPickerValue = {
  latitude: number;
  longitude: number;
  address: string;
  label: string | null;
};

export type LocationPickerProps = {
  initial?: LocationPickerValue | null;
  /** Reports whether the picker is busy (locating / searching / resolving the
      address) so the parent form can disable its submit button. */
  onPendingChange?: (pending: boolean) => void;
};

const GEOLOCATION_DENIED_MESSAGE =
  "Location access was denied. Please allow location access in your browser, or search for your address and place the pin manually.";

const GEOLOCATION_UNAVAILABLE_MESSAGE =
  "We couldn't get a reliable GPS location. Please try again outdoors or search for your address and place the pin manually.";

const POOR_ACCURACY_METERS = 150;
const GOOD_ACCURACY_METERS = 50;
const MAX_FIX_ATTEMPTS = 4;
const FIX_RETRY_DELAY_MS = 2000;
const FIX_TIMEOUT_MS = 10000;

// Fallback map center before the user chooses a location.
const DEFAULT_CENTER: [number, number] = [14.5995, 120.9842];

const PIN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 24 24" fill="#e5c034" stroke="#1f2937" stroke-width="1.1" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="#1f2937" stroke="none"/></svg>';

type LeafletNamespace = typeof import("leaflet");
type LeafletMap = InstanceType<LeafletNamespace["Map"]>;
type LeafletMarker = InstanceType<LeafletNamespace["Marker"]>;

export default function LocationPicker({
  initial,
  onPendingChange,
}: LocationPickerProps) {
  const [latitude, setLatitude] = useState<number | null>(
    initial?.latitude ?? null
  );
  const [longitude, setLongitude] = useState<number | null>(
    initial?.longitude ?? null
  );
  const [address, setAddress] = useState(initial?.address ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  // True while the reverse-geocoded address is being resolved so the parent
  // form can disable Save until the address has been filled in.
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const mountedRef = useRef(true);

  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const leafletRef = useRef<LeafletNamespace | null>(null);

  // Keeps async callbacks on the latest coordinates.
  const coordsRef = useRef<{ lat: number | null; lng: number | null }>({
    lat: initial?.latitude ?? null,
    lng: initial?.longitude ?? null,
  });

  // Accuracy is only meaningful for a browser GPS/network fix.
  // Manual map placement sets this to null because the user explicitly chose
  // the point on the map.
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);

  const setCoords = (lat: number, lng: number) => {
    coordsRef.current = { lat, lng };
    setLatitude(lat);
    setLongitude(lng);
  };

  const setManualCoords = (lat: number, lng: number) => {
    setCoords(lat, lng);
    setAccuracyMeters(null);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setResolvingAddress(true);
    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });

      const payload = (await response.json()) as {
        address?: string;
        error?: string;
      };

      if (response.ok && payload.address) {
        setAddress(payload.address);
      }
    } catch {
      // Keep the address editable if reverse geocoding fails.
      setStatus(
        "Couldn't auto-detect the address for this spot — please type your full delivery address below."
      );
    } finally {
      setResolvingAddress(false);
    }
  };

  const movePin = (lat: number, lng: number, flyTo: boolean) => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    const existing = markerRef.current;

    if (existing) {
      existing.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "",
          html: PIN_SVG,
          iconSize: [34, 44],
          iconAnchor: [17, 42],
        }),
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const position = marker.getLatLng();

        setManualCoords(position.lat, position.lng);
        setError(null);
        setStatus(
          "Pin moved manually — this is now your selected delivery spot."
        );

        void reverseGeocode(position.lat, position.lng);
      });

      markerRef.current = marker;
    }

    if (flyTo) {
      map.flyTo([lat, lng], 17, { duration: 0.6 });
    }
  };

  const getPosition = () =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: FIX_TIMEOUT_MS,
          maximumAge: 0,
        }
      );
    });

  const isPermissionDenied = (error: unknown): boolean =>
    error instanceof GeolocationPositionError
      ? error.code === GeolocationPositionError.PERMISSION_DENIED
      : error !== null &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: unknown }).code === 1;

  const useCurrentLocation = async () => {
    setError(null);
    setStatus(null);

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setError(GEOLOCATION_UNAVAILABLE_MESSAGE);
      return;
    }

    setLocating(true);
    setStatus("Acquiring a precise location — this can take a few seconds…");

    // The FIRST browser fix is usually the coarsest (WiFi/cell based). Ask a
    // few times and keep the best fix so the pin lands on the GPS lock rather
    // than the initial coarse estimate.
    let best: GeolocationPosition | null = null;

    for (let attempt = 0; attempt < MAX_FIX_ATTEMPTS; attempt++) {
      if (!mountedRef.current) return;

      if (attempt > 0) {
        setStatus(
          `Refining location… (attempt ${attempt + 1} of ${MAX_FIX_ATTEMPTS})`
        );
      }

      let position: GeolocationPosition;
      try {
        position = await getPosition();
      } catch (geoError) {
        if (isPermissionDenied(geoError)) {
          setError(GEOLOCATION_DENIED_MESSAGE);
          setLocating(false);
          return;
        }
        // Non-fatal — keep refining until the attempts run out.
        continue;
      }

      const accuracy = Math.round(position.coords.accuracy);

      if (!best || accuracy < Math.round(best.coords.accuracy)) {
        best = position;
      }

      // Good enough for delivery — stop refining.
      if (accuracy <= GOOD_ACCURACY_METERS) break;

      // Give the GPS receiver a moment to lock in before the next attempt.
      await new Promise((resolve) => setTimeout(resolve, FIX_RETRY_DELAY_MS));
    }

    if (!mountedRef.current) return;

    setLocating(false);

    if (!best) {
      // Important: do NOT silently fall back to a low-accuracy network
      // location. For delivery, a wrong location is worse than asking the
      // customer to place the pin manually.
      setError(GEOLOCATION_UNAVAILABLE_MESSAGE);
      return;
    }

    const lat = best.coords.latitude;
    const lng = best.coords.longitude;
    const accuracy = Math.round(best.coords.accuracy);

    setCoords(lat, lng);
    setAccuracyMeters(accuracy);
    movePin(lat, lng, true);

    if (accuracy > POOR_ACCURACY_METERS) {
      setStatus(
        `Best location found is still only about ±${accuracy} m. ` +
          "Please move the pin to your exact delivery spot before saving."
      );
    } else if (accuracy > GOOD_ACCURACY_METERS) {
      setStatus(
        `Best location found (±${accuracy} m). ` +
          "Please review the pin and move it if needed before saving."
      );
    } else {
      setStatus(
        `Precise location found (±${accuracy} m). ` +
          "Review the pin and address before saving."
      );
    }

    // Resolve the address after the pin is placed.
    void reverseGeocode(lat, lng);
  };

  const findAddress = async () => {
    const query = searchQuery.trim();

    if (!query) {
      setError("Type an address, street or landmark to search.");
      return;
    }

    setError(null);
    setStatus(null);
    setSearching(true);

    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: query }),
      });

      const payload = (await response.json()) as {
        latitude?: number;
        longitude?: number;
        address?: string;
        error?: string;
      };

      if (
        !response.ok ||
        typeof payload.latitude !== "number" ||
        typeof payload.longitude !== "number"
      ) {
        setError(payload.error ?? "We couldn't find that address. Try again.");
        return;
      }

      setCoords(payload.latitude, payload.longitude);
      setAccuracyMeters(null);
      setAddress(payload.address ?? query);
      setStatus(
        "Address found. Please review the pin and move it if necessary."
      );
      movePin(payload.latitude, payload.longitude, true);
    } catch {
      setError("We couldn't look up that address right now. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;
    let resizeObserver: ResizeObserver | null = null;

    (async () => {
      const L = await import("leaflet");

      if (cancelled || !mapHostRef.current) return;

      leafletRef.current = L;

      map = L.map(mapHostRef.current, {
        zoomControl: true,
      });

      mapRef.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      const { lat, lng } = coordsRef.current;

      map.setView(
        lat !== null && lng !== null ? [lat, lng] : DEFAULT_CENTER,
        lat !== null && lng !== null ? 17 : 15
      );

      map.on("click", (event) => {
        setManualCoords(event.latlng.lat, event.latlng.lng);
        setError(null);
        setStatus(
          "Pin placed manually — review the address below, then continue."
        );

        movePin(event.latlng.lat, event.latlng.lng, false);
        void reverseGeocode(event.latlng.lat, event.latlng.lng);
      });

      if (lat !== null && lng !== null) {
        movePin(lat, lng, false);
      }

      resizeObserver = new ResizeObserver(() => {
        map?.invalidateSize();
      });

      resizeObserver.observe(mapHostRef.current);

      requestAnimationFrame(() => map?.invalidateSize());
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      map?.remove();

      mapRef.current = null;
      markerRef.current = null;
      leafletRef.current = null;
    };
    // Map is intentionally initialized once after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keeps the location-refinement loop from updating state after unmount.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Let the parent form disable Save while the picker is busy (locating,
  // searching, or resolving the address).
  const pending = locating || searching || resolvingAddress;
  useEffect(() => {
    onPendingChange?.(pending);
  }, [pending, onPendingChange]);

  return (
    <div className={styles.wrapper}>
      <input type="hidden" name="latitude" value={latitude ?? ""} />
      <input type="hidden" name="longitude" value={longitude ?? ""} />
      <input type="hidden" name="address" value={address} />
      <input type="hidden" name="label" value={label} />

      {/* Useful for server-side validation when the coordinates came from GPS.
          Manual map selection intentionally sends an empty value. */}
      <input
        type="hidden"
        name="locationAccuracy"
        value={accuracyMeters ?? ""}
      />

      <button
        type="button"
        className={styles.locateButton}
        onClick={useCurrentLocation}
        disabled={locating}
      >
        <MapPinIcon size={16} />
        {locating ? "Getting your precise location…" : "Use my current location"}
      </button>

      <div className={styles.searchRow}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Or type your address to find it…"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void findAddress();
            }
          }}
          aria-label="Search for an address"
        />

        <button
          type="button"
          className={styles.searchButton}
          onClick={() => void findAddress()}
          disabled={searching}
        >
          <SearchIcon size={14} />
          {searching ? "Finding…" : "Find"}
        </button>
      </div>

      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}

      {status ? (
        <p role="status" className={styles.status}>
          {status}
        </p>
      ) : null}

      <div className={styles.mapFrame}>
        <div
          ref={mapHostRef}
          className={styles.map}
          aria-label="Your delivery location on the map"
        />
      </div>

      <p className={styles.mapHint}>
        Tip: drag the pin or tap the map to fine-tune the exact delivery spot.
      </p>

      <div className={styles.field}>
        <label htmlFor="loc-label" className={styles.label}>
          Location label (optional):
        </label>

        <input
          id="loc-label"
          type="text"
          className={styles.input}
          placeholder="e.g. Home, Office"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="loc-address" className={styles.label}>
          Delivery address:
        </label>

        <textarea
          id="loc-address"
          name="address-display"
          className={styles.textarea}
          rows={3}
          placeholder="Street, barangay, city, province"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          required
        />
      </div>
    </div>
  );
}
