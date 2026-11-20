import { products } from "./products";

export const asset = (file: string) =>
  import.meta.env.BASE_URL + "images/" + file;
export const money = (amount: number) =>
  new Intl.NumberFormat("en-US").format(amount) + " UZS";
export const categories = ["T-shirts", "Pants", "Hoodies", "Jackets"] as const;
export const sizes = ["S", "M", "L", "XL"] as const;
export type Product = (typeof products)[number];
export type CartItem = { id: string; size: string; color: string; qty: number };
export const storageKey = "shop-city.bag.v1";
export const itemKey = (item: Omit<CartItem, "qty">) =>
  [item.id, item.color, item.size].join("/");
export const readBag = (): CartItem[] => {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(saved)) return [];
    const bag = new Map<string, CartItem>();
    for (const item of saved) {
      const p = item && products.find((product) => product.id === item.id);
      if (
        !p ||
        !p.colors.includes(item.color) ||
        !(sizes as readonly string[]).includes(item.size) ||
        !Number.isInteger(item.qty) ||
        item.qty < 1
      )
        continue;
      const key = itemKey(item);
      bag.set(key, {
        id: p.id,
        size: item.size,
        color: item.color,
        qty: Math.min(99, item.qty + (bag.get(key)?.qty ?? 0)),
      });
    }
    return [...bag.values()];
  } catch {
    return [];
  }
};

export const edits = [
  {
    title: "After Hours",
    lines: ["AFTER", "HOURS."],
    label: "Autumn / Winter 2026",
    description:
      "Technical layers and oversized silhouettes, after dark in Tashkent.",
    categories: ["Jackets", "Pants"],
    alt: "Two models in dark layers outside a concrete apartment block",
  },
  {
    title: "Off Duty",
    lines: ["OFF", "DUTY."],
    label: "The essentials edit",
    description: "Easy proportions in washed cotton and wide-leg denim.",
    categories: ["T-shirts", "Pants"],
    alt: "A model wearing an oversized tee and wide denim beneath a city underpass",
  },
  {
    title: "Cold Front",
    lines: ["COLD", "FRONT."],
    label: "The layering edit",
    description:
      "Heavy fleece and structured outerwear for colder city mornings.",
    categories: ["Hoodies", "Jackets"],
    alt: "A model in a light hoodie and dark jacket sitting on a concrete ledge",
  },
];
export const shopLink = (params: Record<string, string> = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  return "#/shop" + (query ? "?" + query : "");
};
