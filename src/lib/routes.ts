/** URL builders. Keep every internal link going through these. */

export type DiscoverParams = {
  city: string;
  cat?: string | null;
  sub?: string | null;
  q?: string | null;
};

export const DASHBOARD_TABS = ["oversikt", "profil", "boost", "installningar"] as const;
export type DashboardTab = (typeof DASHBOARD_TABS)[number];

export const routes = {
  home: () => "/",
  discover: ({ city, cat, sub, q }: DiscoverParams) => {
    let path = "/utforska/" + city;
    if (cat) path += "/" + cat;
    if (cat && sub) path += "/" + sub;
    return q ? path + "?q=" + encodeURIComponent(q) : path;
  },
  business: (id: string) => "/foretag/" + id,
  forBusiness: () => "/for-foretag",
  /** The sign-up form on the business page. */
  addBusiness: () => "/for-foretag#lagg-till",
  dashboard: (tab: DashboardTab = "oversikt") => "/konto/" + tab,
};

export const CITY_COOKIE = "tipsly_city";
export const SAVED_STORAGE_KEY = "tipsly-saved";
