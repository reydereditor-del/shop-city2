export interface Colorway {
  name: string;
  hex: string;
  images: Partial<Record<"model" | "detail" | "garment", string>>;
  variants: { id: string; size: string; stock: number }[];
}

export interface Product {
  id: string; // Public slug used by existing hash routes and bags.
  name: string;
  category: string;
  categoryPosition: number;
  description: string;
  price: number;
  originalPrice?: number;
  colors: string[];
  colorways: Colorway[];
  image: string;
  detail: string;
}
export function mainImage(w: Colorway) {
  return (w.images.model ?? w.images.garment ?? w.images.detail)!;
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("Invalid catalog record");
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  if (typeof value !== "string" || !value.length)
    throw Error("Missing catalog field");
  return value;
}
function integer(value: unknown, min = 0): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min)
    throw Error("Invalid numeric catalog field");
  return value;
}
function toColorway(value: unknown): Colorway {
  const row = record(value),
    source = record(row.images);
  const images: Colorway["images"] = {};
  for (const kind of ["model", "garment", "detail"] as const) {
    if (source[kind] === undefined) continue;
    const path = text(source[kind]);
    if (
      !/^[\w-]+\.(webp|avif|png|jpe?g)$/.test(path) &&
      !/^https:\/\/[^\s]+$/.test(path)
    )
      throw Error("Invalid catalog image");
    images[kind] = path;
  }
  if (
    !Object.keys(images).length ||
    !Array.isArray(row.variants) ||
    !row.variants.length
  )
    throw Error("Incomplete colorway");
  const hex = text(row.hex);
  if (!/^#[\da-f]{6}$/i.test(hex)) throw Error("Invalid swatch");
  return {
    name: text(row.name),
    hex,
    images,
    variants: row.variants.map((v) => {
      const variant = record(v);
      return {
        id: text(variant.id),
        size: text(variant.size),
        stock: integer(variant.stock),
      };
    }),
  };
}
export function mapProduct(input: unknown): Product {
  const row = record(input);
  if (!Array.isArray(row.colorways) || !row.colorways.length)
    throw Error("Incomplete product");
  const colorways = row.colorways.map(toColorway);
  const regular = integer(row.price_uzs, 1);
  const sale = row.sale_uzs === null ? undefined : integer(row.sale_uzs, 1);
  if (sale !== undefined && sale >= regular) throw Error("Invalid sale price");
  const image = mainImage(colorways[0]);
  return {
    id: text(row.slug),
    name: text(row.name),
    description: typeof row.description === "string" ? row.description : "",
    category: text(row.category),
    categoryPosition: integer(row.category_position),
    price: sale ?? regular,
    originalPrice: sale ? regular : undefined,
    colors: colorways.map((w) => w.name),
    colorways,
    image,
    detail: colorways[0].images.detail ?? image,
  };
}

// Supabase's Data API is PostgREST. The publishable key goes only to the configured origin.
export async function fetchCatalog(
  url: string,
  key: string,
  signal: AbortSignal,
  request: typeof fetch = fetch,
): Promise<Product[]> {
  const endpoint = new URL("/rest/v1/catalog_feed", url);
  endpoint.searchParams.set(
    "select",
    "id,slug,name,description,category,category_position,price_uzs,sale_uzs,colorways",
  );
  endpoint.searchParams.set("order", "position.asc,id.asc");
  endpoint.searchParams.set("limit", "100");
  const products: Product[] = [];
  for (let offset = 0; ;) {
    endpoint.searchParams.set("offset", String(offset));
    const response = await request(endpoint, {
      headers: {
        apikey: key,
        Accept: "application/json",
        Prefer: "count=exact",
      },
      signal,
      redirect: "error",
      cache: "no-store",
      credentials: "omit",
    });
    if (!response.ok)
      throw Error("Catalog service returned " + response.status);
    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) throw Error("Invalid catalog response");
    if (!rows.length) return products;
    products.push(...rows.map(mapProduct));
    // Use actual length so a project with a lower Data API max_rows still works.
    offset += rows.length;
    const total = response.headers.get("Content-Range")?.split("/")[1];
    if (total && /^\d+$/.test(total) && offset >= Number(total))
      return products;
  }
}
