import type { IconName } from "@/components/ui/icon";

export type City = {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  /** 1 = small town, 3 = one of the three largest cities. */
  size: 1 | 2 | 3;
  zip: string;
  hoods: string[];
};

/** [name, price, detail] */
export type Service = [string, string, string];
/** Opening span in minutes after midnight, or null when closed. */
export type DayHours = [number, number] | null;
/** Indexed by Date#getDay(): 0 = Sunday … 6 = Saturday. */
export type WeekHours = DayHours[];

export type Subcategory = {
  id: string;
  cat: string;
  name: string;
  plural: string;
  /** Short label for the photo placeholder, e.g. "salong". */
  img: string;
  hours: WeekHours;
  names: string[];
  desc: string[];
  services: Service[];
};

export type Category = {
  id: string;
  name: string;
  icon: IconName;
  hue: number;
  /** Multiplier for the typical Boost bid in this category. */
  bid: number;
  blurb: string;
  /** Category photos shown for businesses that haven't uploaded their own. */
  covers?: string[];
  subs: Subcategory[];
};

export type Business = {
  id: string;
  name: string;
  cat: string;
  sub: string;
  city: string;
  hood: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  reviews: number;
  /** Percent increase in profile visits over the last seven days. */
  trend: number;
  /** Days since the business was added to Tipsly. */
  added: number;
  pop: number;
  desc: string;
  about: string;
  services: Service[];
  hours: WeekHours;
  phone: string;
  web: string;
  insta: string;
  founded: number;
  sponsored: boolean;
  /** Real photos, when the business has uploaded any. */
  photos?: string[];
  /** One of the category photos, used when there are no photos of its own. */
  cover?: string;

  // Derived presentation fields
  cityName: string;
  catName: string;
  subName: string;
  subPlural: string;
  icon: IconName;
  tone: string;
  toneInk: string;
  initials: string;
  imgLabel: string;
  hasRating: boolean;
  ratingText: string;
  reviewsText: string;
  reviewsShort: string;
  hasTrend: boolean;
  trendText: string;
  isNew: boolean;
  place: string;
  bayes: number;
  href: string;
};

export type SortId = "popular" | "rating" | "new" | "relevance";
export type SortOption = { id: SortId; label: string; hint: string };

export type QueryOptions = {
  city: string;
  cat?: string | null;
  sub?: string | null;
  q?: string;
  sort?: SortId;
  openNow?: boolean;
  topRated?: boolean;
  /** Stockholm wall-clock time, required for the openNow filter. */
  now?: Date | null;
};

export type QueryResult = { results: Business[]; sponsored: Business | null; total: number };

export type SuggestItem =
  | { kind: "sub"; id: string; cat: string; label: string; meta: string; icon: IconName }
  | { kind: "city"; id: string; label: string; meta: string; icon: IconName }
  | { kind: "biz"; id: string; label: string; meta: string; initials: string; tone: string; toneInk: string };

export type SuggestGroup = { label: string; items: SuggestItem[] };

export type OpenStatus = { open: boolean; label: string; detail: string };
export type HoursRow = { day: string; text: string; today: boolean; closed: boolean };
export type Review = { id: string; name: string; initial: string; rating: number; text: string; date: string };
export type RatingBar = { stars: number; pct: number };

export type Week = { start: Date; end: Date; week: number; range: string };
export type Periods = {
  current: Week;
  next: Week;
  closesAt: Date;
  closesText: string;
  endsText: string;
  startsText: string;
  past: { week: number; range: string }[];
};

export type Bid = { who: string; amount: number; time: string; mine: boolean };
export type Market = { leading: number; minBid: number; step: number; sponsor: Business; bids: Bid[] };

export type OwnerStats = {
  days: { label: string; value: number; boosted: boolean }[];
  kpis: { label: string; value: string; delta: string; up: boolean; icon: IconName }[];
};
