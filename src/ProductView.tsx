import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Price, ProductCard } from "./components";
import { products } from "./products";
import { asset, shopLink, sizes, type CartItem, type Product } from "./store";

const swatches: Record<string, string> = {
  Black: "#242426",
  Olive: "#61624b",
  Bone: "#e9e4d8",
  Slate: "#686966",
  Indigo: "#303846",
  Ash: "#b7b6b2",
  Sand: "#b5a284",
  Charcoal: "#4e4d4a",
  Oxblood: "#682c35",
};
export const variantPhoto = (p: Product, color: string, detail = false) =>
  color === p.colors[0]
    ? detail
      ? p.detail
      : p.image
    : "product-" + p.id + "-alt" + (detail ? "-detail" : "") + ".webp";
export function ProductView({
  p,
  add,
}: {
  p: Product;
  add: (item: CartItem) => void;
}) {
  const [color, setColor] = useState(p.colors[0]);
  const [size, setSize] = useState("");
  const [photo, setPhoto] = useState(0);
  const [error, setError] = useState(false);
  return (
    <section className="section product-view">
      <div className="crumb">
        <a href="#/">Home</a> /{" "}
        <a href={shopLink({ category: p.category })}>{p.category}</a> / {p.name}
      </div>
      <div className="pdp">
        <div className="gallery">
          <div className="main-photo">
            <img
              src={asset(variantPhoto(p, color, photo === 1))}
              alt={
                p.name +
                " in " +
                color +
                (photo === 1 ? ", fabric detail" : ", on model")
              }
            />
          </div>
          <div className="thumbs" aria-label="Product gallery">
            {["On model", "Fabric detail"].map((label, i) => (
              <button
                key={label}
                aria-label={label}
                aria-pressed={i === photo}
                onClick={() => setPhoto(i)}
              >
                <img alt="" src={asset(variantPhoto(p, color, i === 1))} />
              </button>
            ))}
          </div>
        </div>
        <div className="product-info">
          <div className="eyebrow">
            <b />
            {p.category}
          </div>
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
                    onChange={() => setColor(c)}
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
            <ShoppingBag size={17} />
            Add to bag
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
