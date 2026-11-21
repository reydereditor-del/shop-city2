import { mainImage, type Product } from "./catalog-api";
export type { Product } from "./catalog-api";

export const asset = (file: string) =>
  file.startsWith("https://")
    ? file
    : import.meta.env.BASE_URL + "images/" + file;
export const money = (amount: number) =>
  new Intl.NumberFormat("en-US").format(amount) + " UZS";
export type CartItem = { id: string; size: string; color: string; qty: number };
export const storageKey = "shop-city.bag.v1";
export const itemKey = (item: Omit<CartItem, "qty">) =>
  JSON.stringify([item.id, item.color, item.size]);
export const readBag = (): CartItem[] => {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(saved)) return [];
    const bag = new Map<string, CartItem>();
    for (const item of saved) {
      if (
        !item ||
        typeof item.id !== "string" ||
        typeof item.color !== "string" ||
        typeof item.size !== "string" ||
        !Number.isInteger(item.qty) ||
        item.qty < 1
      )
        continue;
      const key = itemKey(item);
      bag.set(key, {
        id: item.id,
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

export const garmentPhoto = (p: Product) =>
  p.colorways[0].images.garment ?? p.image;
export const variantPhoto = (p: Product, color: string) =>
  mainImage(p.colorways.find((w) => w.name === color) ?? p.colorways[0]);
export const stockLimit = (
  p: Product | undefined,
  item: Omit<CartItem, "qty">,
) =>
  Math.min(
    99,
    p?.colorways
      .find((w) => w.name === item.color)
      ?.variants.find((v) => v.size === item.size)?.stock ?? 0,
  );

export const archiveEdits = [
  {
    title: "After Hours",
    image: "campaign-0.webp",
    description:
      "Technical layers and oversized silhouettes, after dark in Tashkent.",
    categories: ["Jackets", "Pants"],
    alt: "Two models in dark layers outside a concrete apartment block",
  },
  {
    title: "Off Duty",
    image: "campaign-1.webp",
    description: "Easy proportions in washed cotton and wide-leg denim.",
    categories: ["T-shirts", "Pants"],
    alt: "A model wearing an oversized tee and wide denim beneath a city underpass",
  },
  {
    title: "Cold Front",
    image: "campaign-2.webp",
    description:
      "Heavy fleece and structured outerwear for colder city mornings.",
    categories: ["Hoodies", "Jackets"],
    alt: "A model in a light hoodie and dark jacket sitting on a concrete ledge",
  },
];

export const edits = [
  ...archiveEdits,
  {
    title: "Soft Structure",
    description: "Loose canvas, wide trousers and easy cotton layers.",
    categories: ["Jackets", "Pants", "T-shirts"],
    alt: "Sand and charcoal layers in daylight",
  },
];
export const shopLink = (params: Record<string, string> = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  return "#/shop" + (query ? "?" + query : "");
};
