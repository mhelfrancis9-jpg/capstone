"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import styles from "./OrdersManager.module.css";

/**
 * Read-only Leaflet map used in the admin Orders "View Location" modal.
 *
 * Follows the same leaflet pattern as the customer LocationPicker (dynamic
 * import + OpenStreetMap tiles + ResizeObserver), but is display-only: the
 * map is centered on the coordinates snapshotted on the order and shows a
 * single pin. Orders without recorded coordinates get a fallback callout
 * instead of the map.
 */

const PIN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 24 24" fill="#e5c034" stroke="#1f2937" stroke-width="1.1" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="#1f2937" stroke="none"/></svg>';

type LeafletNamespace = typeof import("leaflet");
type LeafletMap = InstanceType<LeafletNamespace["Map"]>;

type OrderLocationMapProps = {
  latitude: number | null;
  longitude: number | null;
  /** The order's delivery address, used for the Google Maps fallback link. */
  address: string | null;
};

function googleMapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export default function OrderLocationMap({
  latitude,
  longitude,
  address,
}: OrderLocationMapProps) {
  const mapHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only initialize a map when the order actually has coordinates.
    if (latitude === null || longitude === null) return;

    let cancelled = false;
    let map: LeafletMap | null = null;
    let resizeObserver: ResizeObserver | null = null;

    (async () => {
      const L = await import("leaflet");

      if (cancelled || !mapHostRef.current) return;

      map = L.map(mapHostRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.setView([latitude, longitude], 17);

      L.marker([latitude, longitude], {
        icon: L.divIcon({
          className: "",
          html: PIN_SVG,
          iconSize: [34, 44],
          iconAnchor: [17, 42],
        }),
      }).addTo(map);

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
    };
  }, [latitude, longitude]);

  if (latitude === null || longitude === null) {
    return (
      <div className={styles.mapFallback} role="note">
        <p className={styles.mapFallbackText}>
          No coordinates were recorded for this order
          {address ? " — you can still open the address in Google Maps." : "."}
        </p>
        {address ? (
          <a
            className={styles.mapFallbackLink}
            href={googleMapsSearchUrl(address)}
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={mapHostRef}
      className={styles.locationMap}
      aria-label="Customer delivery location on the map"
    />
  );
}