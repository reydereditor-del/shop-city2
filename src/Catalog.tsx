import { Search, SlidersHorizontal, X } from "lucide-react";
import { products } from "./products";
import { categories, edits, shopLink } from "./store";
import { ProductCard } from "./components";

export function Catalog({ params }: { params: URLSearchParams }) {
  const edit = edits.find((e) => e.title === params.get("edit"));
  const sale = params.get("sale") === "1";
  const category = params.get("category") || "";
  const query = params.get("q")?.trim().toLowerCase() || "";
  const band = params.get("price") || "";
  const order = params.get("sort") || "";
  const onModel = params.get("view") === "model";

  const update = (name: string, value: string) => {
    // Consecutive controls can change before the hashchange rerender. Preserve the latest URL selection.
    const query = location.hash.split("?")[1] ?? "";
    const current = Object.fromEntries(new URLSearchParams(query));
    location.hash = shopLink({ ...current, [name]: value });
  };
  const displayed = products.filter(
    (p) =>
      (!sale || p.originalPrice) &&
      (!edit || edit.categories.includes(p.category)) &&
      (!category || p.category === category) &&
      (!query ||
        [p.name, p.category, ...p.colors]
          .join(" ")
          .toLowerCase()
          .includes(query)) &&
      (band === "under"
        ? p.price < 300000
        : band === "mid"
          ? p.price >= 300000 && p.price <= 500000
          : band === "over"
            ? p.price > 500000
            : true),
  );
  if (order === "asc") displayed.sort((a, b) => a.price - b.price);
  if (order === "desc") displayed.sort((a, b) => b.price - a.price);
  const title =
    edit?.title || (sale ? "Sale" : query ? "Search results" : "Shop all");
  const reset = shopLink({
    ...(edit ? { edit: edit.title } : {}),
    ...(sale ? { sale: "1" } : {}),
  });
  return (
    <section className="section catalog">
      <div className="crumb">
        <a href="#/">Home</a> / {title}
      </div>
      <div className="catalog-title">
        <h1>{title}</h1>
        {edit && <p>{edit.description}</p>}
      </div>
      <div className="filter-tools">
        <div className="category-tabs" aria-label="Filter by category">
          {["", ...categories].map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => update("category", c)}
            >
              {c || "All pieces"}
            </button>
          ))}
        </div>
        <div className="selects">
          <label>
            <SlidersHorizontal size={14} />
            <span className="sr">Filter by price</span>
            <select
              value={band}
              onChange={(e) => update("price", e.target.value)}
            >
              <option value="">All prices</option>
              <option value="under">Under 300,000 UZS</option>
              <option value="mid">300,000–500,000 UZS</option>
              <option value="over">Over 500,000 UZS</option>
            </select>
          </label>
          <label>
            <span className="sr">Sort products</span>
            <select
              value={order}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="">Featured</option>
              <option value="asc">Price: low to high</option>
              <option value="desc">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>
      <div className="catalog-meta">
        <div className="results" role="status">
          <span>
            {displayed.length} {displayed.length === 1 ? "piece" : "pieces"}
            {query && <> matching “{params.get("q")}”</>}
          </span>
          {(category || band || query || order) && (
            <a href={reset}>
              Clear filters <X size={12} />
            </a>
          )}
        </div>
        <div className="view-switch" aria-label="Product photography">
          <button aria-pressed={!onModel} onClick={() => update("view", "")}>
            Garment
          </button>
          <span>/</span>
          <button
            aria-pressed={onModel}
            onClick={() => update("view", "model")}
          >
            On model
          </button>
        </div>
      </div>
      {displayed.length ? (
        <div className="grid">
          {displayed.map((p) => (
            <ProductCard key={p.id} p={p} onModel={onModel} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Search />
          <h2>No pieces found</h2>
          <p>Try another search or clear your filters.</p>
          <a className="btn dark" href={reset}>
            Reset filters
          </a>
        </div>
      )}
    </section>
  );
}
