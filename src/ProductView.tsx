import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Price, ProductCard } from "./components";
import { useProducts, demoMode } from "./CatalogSource";
import { asset, shopLink, type CartItem, type Product } from "./store";

function GalleryPhoto({
  file,
  description,
}: {
  file: string;
  description: string;
}) {
  const [frame, setFrame] = useState({ file, description, previous: "" });
  useEffect(() => {
    if (file === frame.file) return;
    let cancelled = false;
    const next = new Image();
    next.src = asset(file);
    // Keep the previous photo visible while the requested color or detail decodes.
    const show = () => {
      if (!cancelled) setFrame({ file, description, previous: frame.file });
    };
    next.decode().then(show, show);
    return () => {
      cancelled = true;
    };
  }, [file, description, frame.file]);
  return (
    <>
      {frame.previous && (
        <img className="gallery-underlay" src={asset(frame.previous)} alt="" />
      )}
      <img
        className={frame.previous ? "gallery-incoming" : undefined}
        key={frame.file}
        src={asset(frame.file)}
        alt={frame.description}
      />
    </>
  );
}
export function ProductView({
  p,
  add,
}: {
  p: Product;
  add: (item: CartItem) => void;
}) {
  const products = useProducts();
  const [color, setColor] = useState(p.colors[0]);
  const [size, setSize] = useState("");
  const [photo, setPhoto] = useState("On model");
  const selectedColor = p.colorways.find((w) => w.name === color)!;
  const views = [
    { label: "On model", file: selectedColor.images.model },
    { label: "Garment", file: selectedColor.images.garment },
    { label: "Fabric detail", file: selectedColor.images.detail },
  ].filter((v): v is { label: string; file: string } => Boolean(v.file));
  const available = selectedColor.variants.some((v) => v.stock > 0);
  const selected = views.find((v) => v.label === photo) || views[0];
  const [error, setError] = useState(false);
  return (
    <section className="section product-view">
      <div className="crumb">
        <a href="#/">Home</a> /{" "}
        <a href={shopLink({ category: p.category })}>{p.category}</a> / {p.name}
      </div>
      <div className="pdp">
        <div className="gallery">
          <figure className="main-photo">
            <GalleryPhoto
              file={selected.file}
              description={
                p.name + " in " + color + ", " + selected.label.toLowerCase()
              }
            />
          </figure>
          <div className="thumbs" aria-label="Product gallery">
            {views.map((v) => (
              <button
                key={v.label}
                aria-label={v.label}
                aria-pressed={v.label === selected.label}
                onClick={() => setPhoto(v.label)}
              >
                <img src={asset(v.file)} alt="" />
                <span>{v.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="product-info">
          <div className="micro">{p.category}</div>
          <h1>{p.name}</h1>
          <Price p={p} />
          <p>{p.description}</p>
          <fieldset>
            <legend>
              Color <span>/ {color}</span>
            </legend>
            <div className="swatches">
              {p.colors.map((c) => (
                <label key={c}>
                  <input
                    type="radio"
                    name="color"
                    value={c}
                    aria-label={c}
                    checked={color === c}
                    onChange={() => {
                      setColor(c);
                      if (
                        !p.colorways
                          .find((w) => w.name === c)
                          ?.variants.some((v) => v.size === size && v.stock > 0)
                      )
                        setSize("");
                    }}
                  />
                  <span
                    style={{
                      background: p.colorways.find((w) => w.name === c)?.hex,
                    }}
                  >
                    {color === c && (
                      <Check
                        size={15}
                        color={
                          ["Bone", "Sand", "Ash"].includes(c) ? "#111" : "white"
                        }
                      />
                    )}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>
              Size <span>/ {size || "Select a size"}</span>
            </legend>
            <div className="sizes">
              {selectedColor.variants.map(({ size: s, stock }) => (
                <label key={s}>
                  <input
                    type="radio"
                    name="size"
                    disabled={stock === 0}
                    value={s}
                    checked={size === s}
                    onChange={() => {
                      setSize(s);
                      setError(false);
                    }}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {error && (
            <p className="size-error" role="alert">
              Choose a size to add this piece to your bag.
            </p>
          )}
          <button
            className="btn dark add"
            disabled={!available}
            onClick={() => {
              if (size) add({ id: p.id, color, size, qty: 1 });
              else {
                setError(true);
                document
                  .querySelector<HTMLInputElement>("input[name=size]:enabled")
                  ?.focus();
              }
            }}
          >
            {available ? "Add to bag" : "Sold out"} <ShoppingBag size={17} />
          </button>
          <small className="demo-note">
            {demoMode
              ? "Demo store · Sample products and prices"
              : "Catalog preview · Checkout unavailable"}
          </small>
        </div>
      </div>
      <div className="section-title related">
        <h2>Wear it with</h2>
      </div>
      <div className="grid">
        {products
          .filter((v) => v.category !== p.category)
          .slice(0, 4)
          .map((v) => (
            <ProductCard p={v} key={v.id} />
          ))}
      </div>
    </section>
  );
}
