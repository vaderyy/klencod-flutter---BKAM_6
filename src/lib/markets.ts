import {
  ShoppingBasket,
  Beef,
  SprayCan,
  Shirt,
  Leaf,
  Smartphone,
  Footprints,
  Bean,
  Pill,
  Gem,
  Lamp,
  Gamepad2,
  Zap,
  Boxes,
  type LucideIcon,
} from "lucide-react";

export interface MarketDef {
  id: string;
  icon: LucideIcon;
  ar: string;
  en: string;
  hue: number;
}

export const MARKETS: MarketDef[] = [
  { id: "grocery", icon: ShoppingBasket, ar: "سوق غذائية", en: "Grocery Market", hue: 152 },
  { id: "livestock", icon: Beef, ar: "سوق مواشي", en: "Livestock Market", hue: 18 },
  { id: "cleaning", icon: SprayCan, ar: "سوق تنظيف", en: "Cleaning Market", hue: 199 },
  { id: "clothing", icon: Shirt, ar: "سوق ملابس", en: "Clothing Market", hue: 262 },
  { id: "attar", icon: Leaf, ar: "سوق عطار", en: "Spice & Herbs Market", hue: 96 },
  { id: "phones", icon: Smartphone, ar: "سوق هواتف", en: "Phones Market", hue: 217 },
  { id: "shoes", icon: Footprints, ar: "سوق احذية", en: "Shoes Market", hue: 32 },
  { id: "legumes", icon: Bean, ar: "سوق بقوليات", en: "Legumes Market", hue: 70 },
  { id: "pharmacy", icon: Pill, ar: "سوق صيدلية", en: "Pharmacy Market", hue: 340 },
  { id: "gold", icon: Gem, ar: "سوق ذهب", en: "Gold Market", hue: 45 },
  { id: "home", icon: Lamp, ar: "سوق منزلية", en: "Home Goods Market", hue: 176 },
  { id: "toys", icon: Gamepad2, ar: "سوق ألعاب", en: "Toys Market", hue: 290 },
  { id: "electronics", icon: Zap, ar: "سوق كهربائية", en: "Electronics Market", hue: 55 },
  { id: "wholesale", icon: Boxes, ar: "جملة", en: "Wholesale", hue: 12 },
];

export const MARKET_IDS = MARKETS.map((m) => m.id);

export function marketById(id: string): MarketDef {
  return MARKETS.find((m) => m.id === id) ?? MARKETS[0];
}
