import type * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** outline (default) · primary: accent fill, once per view · dark: ink fill · quiet: underlined text */
  variant?: 'outline' | 'primary' | 'dark' | 'quiet';
  /** sm: 36px tall, used inside product cards */
  size?: 'md' | 'sm';
  /** full width, for the sticky mobile buy bar */
  block?: boolean;
  /** renders an <a> instead of a <button> */
  href?: string;
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface BadgeProps {
  /** accent: soft red on accent-soft ("brass" kept as an alias) */
  tone?: 'neutral' | 'accent' | 'brass' | 'ok' | 'alert';
  /** small leading dot for stock status */
  dot?: boolean;
  children?: React.ReactNode;
}
export declare function Badge(props: BadgeProps): React.ReactElement;

export interface SearchFieldProps {
  id?: string;
  /** visually hidden label, default "Tìm sản phẩm" */
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  className?: string;
}
export declare function SearchField(props: SearchFieldProps): React.ReactElement;

export interface PriceTagProps {
  /** selling price in VND, e.g. 2679000 */
  price: number;
  /** list price in VND; shown struck through with the discount only when it is higher than price */
  original?: number;
  size?: 'md' | 'lg';
  /** false hides the "−19%" (cards show it on the photo instead) */
  showOff?: boolean;
}
export declare function PriceTag(props: PriceTagProps): React.ReactElement;

export interface SpecFigureProps {
  /** the number as Vietnamese readers write it: "1,8", "1300", "26" */
  value: string;
  /** small accent chip (product cards) instead of the large serif figure */
  chip?: boolean;
  /** "L", "W", "°", "món" */
  unit?: string;
  /** what the number measures: "Dung tích" */
  label?: string;
  /** one line of context, from real data: "Cho gia đình 4–6 người" */
  note?: string;
  size?: 'md' | 'sm';
  className?: string;
}
export declare function SpecFigure(props: SpecFigureProps): React.ReactElement;

export interface SpecTableProps {
  caption?: string;
  /** [label, value] pairs */
  rows: Array<[React.ReactNode, React.ReactNode]>;
}
export declare function SpecTable(props: SpecTableProps): React.ReactElement;

export interface ProductArtProps {
  kind: 'pan' | 'cooker' | 'blender' | 'fryer' | 'knife' | 'set';
}
export declare function ProductArt(props: ProductArtProps): React.ReactElement;

export interface ProductCardProps {
  name: string;
  /** "Model RK819868" */
  meta?: string;
  href?: string;
  /** product photo URL (the `thumbnail` field); omitted or failing to load → ProductArt stand-in */
  image?: string;
  art?: ProductArtProps['kind'];
  /** small text in the plate's top-left corner; a discount ("−19%") replaces it */
  tag?: string;
  /** 0 shows "Gọi để báo giá" instead of a price */
  price: number;
  original?: number;
  figure?: { value: string; unit?: string; label?: string };
  badges?: Array<{ text: string; tone?: BadgeProps['tone']; dot?: boolean }>;
  /** a plain click on the card opens the quick view instead of following href (modifier clicks still follow it); receives the card link to return focus to */
  onQuickView?: (opener: HTMLElement) => void;
  /** shows "Thêm vào giỏ" (price > 0) or "Gọi báo giá" (price 0) under the card */
  onAdd?: () => void;
  addLabel?: string;
  className?: string;
}
export declare function ProductCard(props: ProductCardProps): React.ReactElement;

export interface CategoryIndexProps {
  items: Array<{ name: string; count: number; href?: string }>;
  /** word after each count, default "mẫu" */
  unit?: string;
  /** one closing line, e.g. "203 sản phẩm Tefal cho bếp" */
  total?: string;
  label?: string;
}
export declare function CategoryIndex(props: CategoryIndexProps): React.ReactElement;

export interface SiteHeaderProps {
  /** site name set in type until the official logo file is placed; default "Tefal" */
  name?: string;
  homeHref?: string;
  items?: Array<string | { label: string; href: string }>;
  /** nav item marked aria-current */
  active?: string;
  cartCount?: number;
  /** the dark promise strip: icon + text, only what the data supports */
  top?: Array<{ icon: IconName; text: string }>;
  /** right end of the strip, e.g. { text: 'Liên hệ showroom', href: '#showroom' } */
  contact?: { text: string; href?: string };
  /** user button beside the cart, and its text at the end of the dark strip */
  account?: { href?: string; text: string; label?: string; signedIn?: boolean };
  /** small word under the name, default "Đồ bếp" */
  sub?: string;
  /** phone layout: icons only, nav moves to the menu */
  compact?: boolean;
  /** current search text, shown in the field */
  query?: string;
  onSearch?: (q: string) => void;
  /** phone: the magnifier button */
  onSearchOpen?: () => void;
  cartHref?: string;
  onCart?: () => void;
  onMenu?: () => void;
  menuOpen?: boolean;
}
export declare function SiteHeader(props: SiteHeaderProps): React.ReactElement;

export type IconName = 'search' | 'bag' | 'menu' | 'arrow' | 'chevron' | 'shield' | 'award' | 'tag' | 'store' | 'phone'
  | 'pot' | 'cooker' | 'fryer' | 'blender' | 'knife' | 'kettle' | 'drop' | 'home' | 'user' | 'eye' | 'eyeOff' | 'logout' | 'close';
export interface IconProps { name: IconName; size?: number; stroke?: number; className?: string }
/** outline icons drawn to match Lucide; colour follows currentColor */
export declare function Icon(props: IconProps): React.ReactElement;

export interface PhotoProps { src: string; alt?: string; eager?: boolean; onError?: () => void; className?: string }
/** a product image, cropped to TF.photoCrop when that is set */
export declare function Photo(props: PhotoProps): React.ReactElement;

export interface PlateProps { image?: string; alt?: string; art?: ProductArtProps['kind']; tag?: string; eager?: boolean; className?: string }
/** white image tray: the photo, or ProductArt when there is none or it fails to load */
export declare function Plate(props: PlateProps): React.ReactElement;

export interface SectionTitleProps {
  title: string;
  note?: string;
  /** link at the right end of the title row */
  moreHref?: string;
  moreLabel?: string;
  className?: string;
}
/** centred serif caps with a short accent rule */
export declare function SectionTitle(props: SectionTitleProps): React.ReactElement;

export interface TrustBarProps {
  items: Array<{ icon: IconName; title: string; text?: string }>;
  /** on ink (footer): no box, light text */
  dark?: boolean;
  className?: string;
}
export declare function TrustBar(props: TrustBarProps): React.ReactElement;

export interface CategoryTileProps {
  name: string;
  /** number of models; omitted shows "Xem ngay" */
  count?: number;
  href?: string;
  image?: string;
  art?: ProductArtProps['kind'];
  icon: IconName;
}
export declare function CategoryTile(props: CategoryTileProps): React.ReactElement;

export interface PromoBannerProps {
  kicker?: string;
  title: string;
  cta?: string;
  /** ink button instead of an underlined arrow link; use on one banner of three */
  solid?: boolean;
  href?: string;
  /** up to two product photos */
  images?: Array<string | undefined>;
  /** drawing shown when there are no photos */
  art?: ProductArtProps['kind'];
  className?: string;
}
export declare function PromoBanner(props: PromoBannerProps): React.ReactElement;

export interface FieldProps {
  id: string;
  label: string;
  value?: string;
  /** receives the new text, not the event */
  onChange?: (value: string) => void;
  type?: string;
  name?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  /** adds "(không bắt buộc)" after the label; fields are required otherwise */
  optional?: boolean;
  /** one line under the field, linked by aria-describedby */
  hint?: string;
  /** says how to fix it; sets aria-invalid */
  error?: string;
  /** element placed inside the field's right edge */
  addon?: React.ReactNode;
}
export declare function Field(props: FieldProps): React.ReactElement;
/** Field with a show/hide password button */
export declare function PasswordField(props: Omit<FieldProps, 'type' | 'addon'>): React.ReactElement;
export interface SelectFieldProps { id: string; label: string; options: string[]; value?: string; onChange?: (value: string) => void; placeholder?: string; autoComplete?: string; error?: string }
export declare function SelectField(props: SelectFieldProps): React.ReactElement;

export interface ChoiceGroupProps {
  /** read by screen readers only */
  legend: string;
  /** radio group name; each input id is name + '-' + key */
  name: string;
  items: Array<{ key: string; title: string; text?: string; icon?: IconName; disabled?: boolean }>;
  value?: string;
  onChange?: (key: string) => void;
}
/** radio choices drawn as cards: delivery, payment */
export declare function ChoiceGroup(props: ChoiceGroupProps): React.ReactElement;

export interface GoogleButtonProps { onClick?: () => void; children?: React.ReactNode }
export declare function GoogleButton(props: GoogleButtonProps): React.ReactElement;

export interface LoginGateProps {
  title: string;
  text?: string;
  signInHref?: string;
  signUpHref?: string;
  browseHref?: string;
  browseLabel?: string;
}
/** shown instead of the cart or checkout when nobody is signed in */
export declare function LoginGate(props: LoginGateProps): React.ReactElement;

export interface QuickViewProps {
  /** null or undefined renders nothing */
  product?: {
    name: string; kicker?: string; meta?: string; href?: string;
    images?: Array<string | undefined>; art?: ProductArtProps['kind'];
    price: number; original?: number;
    badges?: Array<{ text: string; tone?: BadgeProps['tone']; dot?: boolean }>;
    /** up to three */
    figures?: Array<{ value: string; unit?: string; label?: string }>;
    /** first four rows are shown */
    specs?: Array<[React.ReactNode, React.ReactNode]>;
  } | null;
  onClose: () => void;
  onAdd?: () => void;
  addLabel?: string;
  /** target of "Gọi để báo giá" when price is 0 */
  callHref?: string;
  /** one line under the buttons */
  note?: string;
  /** element that gets focus back on close; defaults to the element focused when it opened */
  returnFocus?: HTMLElement | null;
}
/** product modal: photo left, facts and actions right; bottom sheet on phones */
export declare function QuickView(props: QuickViewProps): React.ReactElement | null;

export declare function formatVND(n: number): string;

declare global {
  interface Window {
    TF: {
      Button: typeof Button; Badge: typeof Badge; SearchField: typeof SearchField; PriceTag: typeof PriceTag;
      SpecFigure: typeof SpecFigure; SpecTable: typeof SpecTable; ProductArt: typeof ProductArt;
      ProductCard: typeof ProductCard; CategoryIndex: typeof CategoryIndex; SiteHeader: typeof SiteHeader;
      SectionTitle: typeof SectionTitle; TrustBar: typeof TrustBar; CategoryTile: typeof CategoryTile;
      PromoBanner: typeof PromoBanner; Plate: typeof Plate; Photo: typeof Photo; Icon: typeof Icon;
      Field: typeof Field; PasswordField: typeof PasswordField; SelectField: typeof SelectField;
      ChoiceGroup: typeof ChoiceGroup; GoogleButton: typeof GoogleButton; LoginGate: typeof LoginGate; QuickView: typeof QuickView;
      /** crop applied by Photo, as fractions of the source image; null shows photos whole */
      photoCrop: { x: number; y: number; w: number; h: number } | null;
      formatVND: typeof formatVND;
    };
  }
}
