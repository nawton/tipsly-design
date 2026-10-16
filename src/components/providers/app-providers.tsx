"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Toast } from "@/components/layout/toast";
import type { IconName } from "@/components/ui/icon";
import { byId, isCity } from "@/lib/data";
import { CITY_COOKIE, SAVED_STORAGE_KEY } from "@/lib/routes";

/* ------------------------------------------------------------------ */
/* City                                                                */
/* ------------------------------------------------------------------ */

type CityContextValue = {
  /** The city the visitor is browsing: the URL city on /utforska, else their saved choice. */
  city: string;
  /** Remembers the city. On a /utforska page it also navigates to the same listing in that city. */
  setCity: (id: string) => void;
};

const CityContext = createContext<CityContextValue | null>(null);

const DISCOVER_RE = /^\/utforska\/([^/]+)/;

function writeCityCookie(id: string) {
  document.cookie = `${CITY_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
}

/* ------------------------------------------------------------------ */
/* Saved businesses (localStorage, synced across tabs)                 */
/* ------------------------------------------------------------------ */

export type SavedMap = Record<string, number>;
const EMPTY_SAVED: SavedMap = {};
const savedListeners = new Set<() => void>();
let savedCache: { raw: string | null; value: SavedMap } = { raw: null, value: EMPTY_SAVED };

function readSaved(): SavedMap {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(SAVED_STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: fall back to an empty list.
  }
  if (raw !== savedCache.raw) {
    let value = EMPTY_SAVED;
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === "object") value = parsed as SavedMap;
    } catch {
      // Corrupt value: ignore it.
    }
    savedCache = { raw, value };
  }
  return savedCache.value;
}

function writeSaved(next: SavedMap) {
  try {
    window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: keep the in-memory copy for this session.
    savedCache = { raw: JSON.stringify(next), value: next };
  }
  savedListeners.forEach((l) => l());
}

function subscribeSaved(listener: () => void) {
  savedListeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SAVED_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    savedListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

type SavedContextValue = {
  saved: SavedMap;
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => void;
};

const SavedContext = createContext<SavedContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */

type ToastFn = (message: string, icon?: IconName) => void;
const ToastContext = createContext<ToastFn | null>(null);

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function AppProviders({ initialCity, children }: { initialCity: string; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // City. Visiting /utforska/<city> makes that city the remembered one.
  const [storedCity, setStoredCity] = useState(initialCity);
  const routeCity = pathname.match(DISCOVER_RE)?.[1];
  const urlCity = isCity(routeCity) ? routeCity : null;
  if (urlCity && urlCity !== storedCity) setStoredCity(urlCity);
  const city = urlCity ?? storedCity;

  useEffect(() => {
    writeCityCookie(storedCity);
  }, [storedCity]);

  const setCity = useCallback(
    (id: string) => {
      if (!isCity(id)) return;
      setStoredCity(id);
      const m = pathname.match(DISCOVER_RE);
      if (m) router.push(pathname.replace(DISCOVER_RE, "/utforska/" + id) + window.location.search);
    },
    [pathname, router],
  );

  // Toast
  const [toastState, setToastState] = useState({ message: "", icon: "check" as IconName, visible: false });
  const toastTimer = useRef<number | undefined>(undefined);
  const toast = useCallback<ToastFn>((message, icon = "check") => {
    window.clearTimeout(toastTimer.current);
    setToastState({ message, icon, visible: true });
    toastTimer.current = window.setTimeout(() => setToastState((t) => ({ ...t, visible: false })), 2800);
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // Saved
  const saved = useSyncExternalStore(subscribeSaved, readSaved, () => EMPTY_SAVED);
  const toggleSave = useCallback(
    (id: string) => {
      const next = { ...readSaved() };
      const name = byId[id]?.name ?? "Företaget";
      if (next[id]) {
        delete next[id];
        toast(name + " togs bort från sparade", "bookmark-minus");
      } else {
        next[id] = Date.now();
        toast(name + " är sparat", "bookmark-check");
      }
      writeSaved(next);
    },
    [toast],
  );

  const cityValue = useMemo(() => ({ city, setCity }), [city, setCity]);
  const savedValue = useMemo(
    () => ({ saved, isSaved: (id: string) => !!saved[id], toggleSave }),
    [saved, toggleSave],
  );

  return (
    <CityContext.Provider value={cityValue}>
      <SavedContext.Provider value={savedValue}>
        <ToastContext.Provider value={toast}>
          {children}
          <Toast message={toastState.message} icon={toastState.icon} visible={toastState.visible} />
        </ToastContext.Provider>
      </SavedContext.Provider>
    </CityContext.Provider>
  );
}

function useRequired<T>(ctx: React.Context<T | null>, name: string): T {
  const value = useContext(ctx);
  if (!value) throw new Error(`${name} must be used inside <AppProviders>`);
  return value;
}

export const useCity = () => useRequired(CityContext, "useCity");
export const useSaved = () => useRequired(SavedContext, "useSaved");
export const useToast = () => useRequired(ToastContext, "useToast");
