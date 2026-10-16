import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  BookmarkMinus,
  Briefcase,
  Calendar,
  Car,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Clock,
  CreditCard,
  Dumbbell,
  Eye,
  Gavel,
  Globe,
  Hammer,
  Image as ImageIcon,
  ImagePlus,
  Info,
  Instagram,
  LayoutDashboard,
  LayoutGrid,
  Link as LinkIcon,
  Map as MapIcon,
  MapPin,
  Menu,
  MessageSquare,
  Minus,
  MousePointerClick,
  Navigation,
  Pencil,
  Phone,
  Plus,
  Receipt,
  RefreshCw,
  Scissors,
  Search,
  SearchX,
  Settings,
  Share,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Star,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  UtensilsCrossed,
  WifiOff,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

const icons = {
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-up-down": ArrowUpDown,
  "arrow-up-right": ArrowUpRight,
  bookmark: Bookmark,
  "bookmark-check": BookmarkCheck,
  "bookmark-minus": BookmarkMinus,
  briefcase: Briefcase,
  calendar: Calendar,
  car: Car,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  "circle-alert": CircleAlert,
  "circle-check": CircleCheck,
  "circle-dashed": CircleDashed,
  clock: Clock,
  "credit-card": CreditCard,
  dumbbell: Dumbbell,
  eye: Eye,
  gavel: Gavel,
  globe: Globe,
  hammer: Hammer,
  image: ImageIcon,
  "image-plus": ImagePlus,
  info: Info,
  instagram: Instagram,
  "layout-dashboard": LayoutDashboard,
  "layout-grid": LayoutGrid,
  link: LinkIcon,
  map: MapIcon,
  "map-pin": MapPin,
  menu: Menu,
  "message-square": MessageSquare,
  minus: Minus,
  "mouse-pointer-click": MousePointerClick,
  navigation: Navigation,
  pencil: Pencil,
  phone: Phone,
  plus: Plus,
  receipt: Receipt,
  "refresh-cw": RefreshCw,
  scissors: Scissors,
  search: Search,
  "search-x": SearchX,
  settings: Settings,
  share: Share,
  "shield-check": ShieldCheck,
  "shopping-bag": ShoppingBag,
  sprout: Sprout,
  star: Star,
  store: Store,
  tag: Tag,
  "trash-2": Trash2,
  "trending-up": TrendingUp,
  upload: Upload,
  "utensils-crossed": UtensilsCrossed,
  "wifi-off": WifiOff,
  x: X,
  zap: Zap,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  /** Pixel size of the square icon. */
  size?: number;
  /** Stroke width. Tipsly uses a slightly lighter stroke than Lucide's default. */
  stroke?: number;
  /** Pass "currentColor" for a filled glyph (stars, saved bookmarks). */
  fill?: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Decorative icon. Always hidden from assistive technology: give the
 * surrounding control an accessible name instead.
 */
export function Icon({ name, size = 18, stroke = 1.75, fill = "none", className, style }: IconProps) {
  const Glyph = icons[name];
  return (
    <Glyph
      size={size}
      strokeWidth={stroke}
      fill={fill}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
    />
  );
}
