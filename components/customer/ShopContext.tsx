"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "lnr-cycle-banners-v1";

const SEED_BANNERS = [
  "/Customerpageimages/lnr%20image%20placeholder%201.png",
  "/Customerpageimages/lnr%20placeholder%201.png",
];

type ShopContextValue = {
  banners: string[];
  addBanners: (urls: string[]) => void;
  removeBanner: (url: string) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [banners, setBanners] = useState<string[]>(SEED_BANNERS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Restoring an external store (localStorage) must update state from an
          // effect so server markup and the first client render stay identical.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setBanners(parsed as string[]);
        }
      }
    } catch {
      // Corrupt or unavailable storage — keep seed banners.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
    } catch {
      // Quota exceeded or storage unavailable — state still works in-memory.
    }
  }, [banners]);

  const addBanners = useCallback((urls: string[]) => {
    setBanners((current) => {
      const fresh = urls.filter((url) => !current.includes(url));
      if (fresh.length === 0) return current;
      return [...current, ...fresh];
    });
  }, []);

  const removeBanner = useCallback((url: string) => {
    setBanners((current) => current.filter((banner) => banner !== url));
  }, []);

  const value = useMemo<ShopContextValue>(
    () => ({
      banners,
      addBanners,
      removeBanner,
    }),
    [banners, addBanners, removeBanner]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextValue {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider.");
  }
  return context;
}
