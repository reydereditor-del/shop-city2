export type Category = "T-shirts" | "Pants" | "Hoodies" | "Jackets";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  originalPrice?: number;
  colors: string[];
  description: string;
  image: string;
  detail: string;
}

export const products: Product[] = [
  {
    id: "transit-bomber",
    name: "Transit Shell Bomber",
    category: "Jackets",
    price: 629000,
    colors: ["Black", "Olive"],
    description:
      "Matte nylon gives this boxy bomber a crisp outline. Ribbed edges gather the sleeves and hem, with angled pockets set into the front.",
    image: "product-transit-bomber.webp",
    detail: "product-transit-bomber-detail.webp",
  },
  {
    id: "wash-tee",
    name: "Washed Oversized Tee",
    category: "T-shirts",
    price: 319000,
    colors: ["Slate", "Bone"],
    description:
      "A faded wash brings out the grain of the cotton jersey. Wide sleeves fall to the elbow, while the straight hem sits loose over denim.",
    image: "product-wash-tee.webp",
    detail: "product-wash-tee-detail.webp",
  },
  {
    id: "volume-jeans",
    name: "Volume Baggy Denim",
    category: "Pants",
    price: 499000,
    colors: ["Indigo", "Black"],
    description:
      "Deep indigo denim with a roomy rise and a generous straight leg. Tobacco stitching traces the pockets and the hem stacks over the shoe.",
    image: "product-volume-jeans.webp",
    detail: "product-volume-jeans-detail.webp",
  },
  {
    id: "loft-hoodie",
    name: "Loft Fleece Hoodie",
    category: "Hoodies",
    price: 459000,
    colors: ["Ash", "Black"],
    description:
      "Textured fleece with dropped shoulders and a roomy hood. A wide front pocket keeps the shape relaxed through the body.",
    image: "product-loft-hoodie.webp",
    detail: "product-loft-hoodie-detail.webp",
  },
  {
    id: "canvas-chore",
    name: "Canvas Chore Jacket",
    category: "Jackets",
    price: 579000,
    colors: ["Sand", "Charcoal"],
    description:
      "A short cotton canvas jacket cut wide enough to layer over a sweatshirt. Two oversized patch pockets sit flush against the front.",
    image: "product-canvas-chore.webp",
    detail: "product-canvas-chore-detail.webp",
  },
  {
    id: "field-cargo",
    name: "Field Cargo Trousers",
    category: "Pants",
    price: 429000,
    colors: ["Olive", "Sand"],
    description:
      "Soft cotton twill falls in a broad line from hip to ankle. Low-set cargo pockets give the leg extra room without breaking its silhouette.",
    image: "product-field-cargo.webp",
    detail: "product-field-cargo-detail.webp",
  },
  {
    id: "pocket-tee",
    name: "Box Pocket Tee",
    category: "T-shirts",
    price: 99000,
    originalPrice: 309000,
    colors: ["Bone", "Charcoal"],
    description:
      "An easy crewneck in smooth, substantial jersey. A single square chest pocket balances its broad shoulders and roomy sleeves.",
    image: "product-pocket-tee.webp",
    detail: "product-pocket-tee-detail.webp",
  },
  {
    id: "loopback-crew",
    name: "Loopback Crewneck",
    category: "Hoodies",
    price: 239000,
    originalPrice: 399000,
    colors: ["Oxblood", "Ash"],
    description:
      "A drop-shoulder sweatshirt in dense loopback cotton. Wide ribbed cuffs and a gathered hem give its relaxed body a rounded profile.",
    image: "product-loopback-crew.webp",
    detail: "product-loopback-crew-detail.webp",
  },
];
