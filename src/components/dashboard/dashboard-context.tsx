"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { initialBoostState, type BoostState } from "@/components/boost/boost-state";
import { useToast } from "@/components/providers/app-providers";
import { catById, hm, owner } from "@/lib/data";
import type { Business } from "@/lib/types";
import { saveBusinessProfile } from "./dashboard-api";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ServiceRow = { id: string; name: string; price: string; detail: string };
/** One weekday in the opening-hours editor. `idx` follows Date#getDay(). */
export type HoursRow = { idx: number; open: boolean; from: string; to: string };

export type ProfileForm = {
  name: string;
  desc: string;
  address: string;
  phone: string;
  web: string;
  insta: string;
  cat: string;
  subs: Record<string, boolean>;
  services: ServiceRow[];
  hours: HoursRow[];
};

export type ProfileErrors = Partial<Record<"name" | "desc" | "web", string>>;
export type GalleryImage = { id: string; url: string; name: string };
export type Account = { name: string; email: string };
export type NotificationKey = "outbid" | "weekly" | "reviews";

export const DESC_MAX = 300;
export const MAX_IMAGES = 8;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

type DashboardContextValue = {
  /** The demo owner's business as published (not the unsaved form). */
  biz: Business;
  /** Name shown in the aside and greeting: the last saved name. */
  businessName: string;

  form: ProfileForm;
  errors: ProfileErrors;
  saving: boolean;
  /** The form differs from the saved copy (or is being saved). */
  dirty: boolean;
  updateForm: (patch: (form: ProfileForm) => Partial<ProfileForm>) => void;
  /** Returns a fresh id for a new service row. */
  newServiceId: () => string;
  discardForm: () => void;
  saveForm: () => void;

  logo: string | null;
  setLogoFile: (file: File) => void;
  removeLogo: () => void;
  gallery: GalleryImage[];
  addImages: (files: FileList | null | undefined) => void;
  removeImage: (id: string) => void;
  uploadError: string;

  account: Account;
  setAccount: (patch: Partial<Account>) => void;
  notifications: Record<NotificationKey, boolean>;
  toggleNotification: (key: NotificationKey) => void;
  confirmDelete: boolean;
  setConfirmDelete: (on: boolean) => void;

  boost: BoostState;
  onBoost: (patch: Partial<BoostState>) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* Form helpers                                                        */
/* ------------------------------------------------------------------ */

const HOURS_ORDER = [1, 2, 3, 4, 5, 6, 0];

function initialForm(b: Business): ProfileForm {
  return {
    name: b.name,
    desc: b.desc,
    address: b.address,
    phone: b.phone,
    web: b.web,
    insta: b.insta,
    cat: b.cat,
    subs: { [b.sub]: true },
    services: b.services.map((s, i) => ({ id: "s" + i, name: s[0], price: s[1], detail: s[2] })),
    hours: HOURS_ORDER.map((idx) => {
      const h = b.hours[idx];
      return { idx, open: !!h, from: h ? hm(h[0]) : "09:00", to: h ? hm(h[1]) : "17:00" };
    }),
  };
}

const cloneForm = (f: ProfileForm): ProfileForm => ({
  ...f,
  subs: { ...f.subs },
  services: f.services.map((s) => ({ ...s })),
  hours: f.hours.map((h) => ({ ...h })),
});

/** Order-insensitive for subcategories, so toggling one off and on again is not a change. */
const formKey = (f: ProfileForm) => JSON.stringify({ ...f, subs: Object.keys(f.subs).sort() });

export function validateForm(f: ProfileForm): ProfileErrors {
  const e: ProfileErrors = {};
  if (!f.name.trim()) e.name = "Företaget behöver ett namn.";
  if (f.desc.length > DESC_MAX) e.desc = "Beskrivningen får vara högst 300 tecken.";
  const w = f.web.trim().replace(/^https?:\/\//, "");
  if (w && !/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(w)) e.web = "Webbadressen ser inte rätt ut.";
  return e;
}

const hasErrors = (e: ProfileErrors) => Object.keys(e).length > 0;

type ProfileState = { form: ProfileForm; saved: ProfileForm; errors: ProfileErrors; saving: boolean };

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

/**
 * Holds everything the owner edits in "Mitt företag". It lives in the /konto
 * layout, so unsaved changes, uploads and the auction state survive switching
 * between the dashboard tabs.
 */
export function DashboardProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const biz = owner.biz;

  const [profile, setProfile] = useState<ProfileState>(() => {
    const form = initialForm(biz);
    return { form, saved: cloneForm(form), errors: {}, saving: false };
  });

  const nextId = useRef(100);
  const newServiceId = useCallback(() => "s" + nextId.current++, []);

  const updateForm = useCallback((patch: (form: ProfileForm) => Partial<ProfileForm>) => {
    setProfile((p) => {
      const form = { ...p.form, ...patch(p.form) };
      // Once the owner has tried to save, re-validate as they type.
      return { ...p, form, errors: hasErrors(p.errors) ? validateForm(form) : {} };
    });
  }, []);

  const discardForm = useCallback(() => {
    setProfile((p) => ({ ...p, form: cloneForm(p.saved), errors: {} }));
  }, []);

  const saveForm = useCallback(async () => {
    if (profile.saving) return;
    const errors = validateForm(profile.form);
    if (hasErrors(errors)) {
      setProfile((p) => ({ ...p, errors }));
      return;
    }
    const submitted = cloneForm(profile.form);
    setProfile((p) => ({ ...p, saving: true }));
    try {
      await saveBusinessProfile(submitted);
    } catch {
      setProfile((p) => ({ ...p, saving: false }));
      toast("Ändringarna kunde inte sparas. Försök igen.", "circle-alert");
      return;
    }
    setProfile((p) => ({ ...p, saving: false, saved: submitted }));
    toast("Ändringarna är sparade (demo)", "circle-check");
  }, [profile.form, profile.saving, toast]);

  const dirty = profile.saving || formKey(profile.form) !== formKey(profile.saved);

  // Images are kept as object URLs until a real upload exists. Every URL we
  // create is tracked so it can be released when removed or on unmount.
  const [logo, setLogo] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [uploadError, setUploadError] = useState("");
  const liveUrls = useRef(new Set<string>());

  const createUrl = (file: File) => {
    const url = URL.createObjectURL(file);
    liveUrls.current.add(url);
    return url;
  };
  const revokeUrl = (url: string | null) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    liveUrls.current.delete(url);
  };

  useEffect(() => {
    const urls = liveUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const setLogoFile = (file: File) => {
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError("Logotypen är större än 8 MB.");
      return;
    }
    revokeUrl(logo);
    setLogo(createUrl(file));
    setUploadError("");
    toast("Logotypen är uppladdad", "image");
  };

  const removeLogo = () => {
    revokeUrl(logo);
    setLogo(null);
  };

  const addImages = (files: FileList | null | undefined) => {
    const list = Array.from(files ?? []).filter((f) => /^image\//.test(f.type));
    let error = "";
    const ok = list.filter((f) => {
      if (f.size > MAX_IMAGE_BYTES) {
        error = f.name + " är större än 8 MB.";
        return false;
      }
      return true;
    });
    const room = MAX_IMAGES - gallery.length;
    if (ok.length > room) error = "Du kan ha högst 8 bilder.";
    const added = ok
      .slice(0, Math.max(0, room))
      .map((f) => ({ id: "g" + nextId.current++, url: createUrl(f), name: f.name }));
    setGallery((g) => g.concat(added));
    setUploadError(error);
  };

  const removeImage = (id: string) => {
    revokeUrl(gallery.find((g) => g.id === id)?.url ?? null);
    setGallery((g) => g.filter((x) => x.id !== id));
  };

  // Settings
  const [account, setAccountState] = useState<Account>({ name: owner.name, email: owner.email });
  const setAccount = useCallback((patch: Partial<Account>) => setAccountState((a) => ({ ...a, ...patch })), []);
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    outbid: true,
    weekly: true,
    reviews: false,
  });
  const toggleNotification = useCallback(
    (key: NotificationKey) => setNotifications((n) => ({ ...n, [key]: !n[key] })),
    [],
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Boost
  const [boost, setBoost] = useState<BoostState>(() => initialBoostState(biz.city, biz.cat));
  const onBoost = useCallback((patch: Partial<BoostState>) => setBoost((b) => ({ ...b, ...patch })), []);

  const value: DashboardContextValue = {
    biz,
    businessName: profile.saved.name || biz.name,
    form: profile.form,
    errors: profile.errors,
    saving: profile.saving,
    dirty,
    updateForm,
    newServiceId,
    discardForm,
    saveForm: () => void saveForm(),
    logo,
    setLogoFile,
    removeLogo,
    gallery,
    addImages,
    removeImage,
    uploadError,
    account,
    setAccount,
    notifications,
    toggleNotification,
    confirmDelete,
    setConfirmDelete,
    boost,
    onBoost,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const value = useContext(DashboardContext);
  if (!value) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return value;
}

/** Category of the profile form, falling back to the business' own. */
export const formCategory = (form: ProfileForm) => catById[form.cat] ?? catById.skonhet;
