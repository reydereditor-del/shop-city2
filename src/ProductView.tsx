import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Price, ProductCard } from "./components";
import { products } from "./products";
import {
  asset,
  garmentPhoto,
  shopLink,
  sizes,
  swatches,
  type CartItem,
  type Product,
} from "./store";

export const variantPhoto = (p: Product, color: string, detail = false) =>
  color === p.colors[0]
    ? detail
      ? p.detail
      : p.image
    : "product-" + p.id + "-alt" + (detail ? "-detail" : "") + ".webp";
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
  const [color, setColor] = useState(p.colors[0]);
  const [size, setSize] = useState("");
  const [photo, setPhoto] = useState("On model");
  const views = [
    { label: "On model", file: variantPhoto(p, color) },
    ...(color === p.colors[0]
      ? [{ label: "Garment", file: garmentPhoto(p) }]
      : []),
    { label: "Fabric detail", file: variantPhoto(p, color, true) },
  ];
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
                      if (photo === "Garment" && c !== p.colors[0])
                        setPhoto("On model");
                    }}
                  />
                  <span style={{ background: swatches[c] }}>
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
              {sizes.map((s) => (
                <label key={s}>
                  <input
                    type="radio"
                    name="size"
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
            onClick={() => {
              if (size) add({ id: p.id, color, size, qty: 1 });
              else {
                setError(true);
                document
                  .querySelector<HTMLInputElement>("input[name=size]")
                  ?.focus();
              }
            }}
          >
            Add to bag <ShoppingBag size={17} />
          </button>
          <small className="demo-note">
            Demo store · Sample products and prices
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
