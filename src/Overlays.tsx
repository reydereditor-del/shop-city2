import { useState } from "react";
import { Minus, Plus, Search, ShoppingBag, Trash2 } from "lucide-react";
import { Dialog } from "./components";
import { asset, money, itemKey, shopLink, type CartItem } from "./store";
import { products } from "./products";
import { variantPhoto } from "./ProductView";

export function SearchPanel({ close }: { close: () => void }) {
  const [term, setTerm] = useState("");
  const matches = products.filter((p) =>
    [p.name, p.category, ...p.colors]
      .join(" ")
      .toLowerCase()
      .includes(term.trim().toLowerCase()),
  );
  return (
    <Dialog title="Search the store" close={close}>
      <div className="search-body">
        <form
          className="search-box"
          onSubmit={(e) => {
            e.preventDefault();
            location.hash = shopLink({ q: term.trim() });
            close();
          }}
        >
          <label className="sr" htmlFor="search">
            Search products
          </label>
          <input
            data-initial-focus
            id="search"
            type="search"
            placeholder="Search pieces, colors, categories…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <button className="icon" aria-label="Show all search results">
            <Search size={19} />
          </button>
        </form>
        <p className="eyebrow" role="status">
          {term.trim()
            ? matches.length +
              (matches.length === 1 ? " matching piece" : " matching pieces")
            : "New arrivals"}
        </p>
        <div className="search-list">
          {(term.trim() ? matches : matches.slice(0, 4)).map((p) => (
            <a href={"#/product/" + p.id} onClick={close} key={p.id}>
              <img src={asset(p.image)} alt="" />
              <div>
                <strong>{p.name}</strong>
                <small>{money(p.price)}</small>
              </div>
            </a>
          ))}
        </div>
        {!matches.length && (
          <p>Try a garment like “hoodie” or a color like “olive”.</p>
        )}
      </div>
    </Dialog>
  );
}
export function BagPanel({
  items,
  change,
  close,
}: {
  items: CartItem[];
  change: (key: string, n: number) => void;
  close: () => void;
}) {
  const total = items.reduce(
    (acc, i) => acc + products.find((p) => p.id === i.id)!.price * i.qty,
    0,
  );
  return (
    <Dialog title="Your bag" drawer close={close}>
      {items.length ? (
        <>
          <div className="bag-lines">
            {items.map((i) => {
              const p = products.find((p) => p.id === i.id)!,
                key = itemKey(i);
              return (
                <div className="bag-item" key={key}>
                  <a onClick={close} href={"#/product/" + p.id}>
                    <img
                      src={asset(variantPhoto(p, i.color))}
                      alt={p.name + " in " + i.color}
                    />
                  </a>
                  <div>
                    <a onClick={close} href={"#/product/" + p.id}>
                      <strong>{p.name}</strong>
                    </a>
                    <small>
                      {i.color} / {i.size}
                    </small>
                    <span>{money(p.price)}</span>
                    <div className="qty">
                      <button
                        disabled={i.qty === 1}
                        aria-label={"Decrease quantity of " + p.name}
                        onClick={() => change(key, i.qty - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <output aria-label="Quantity">{i.qty}</output>
                      <button
                        disabled={i.qty >= 99}
                        aria-label={"Increase quantity of " + p.name}
                        onClick={() => change(key, i.qty + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button
                    className="icon remove"
                    aria-label={"Remove " + p.name}
                    onClick={() => change(key, 0)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="bag-total">
            <div>
              <strong>Subtotal</strong>
              <strong>{money(total)}</strong>
            </div>
            <p>
              This is a demo bag. Checkout and order fulfillment are
              unavailable.
            </p>
            <button className="btn dark" onClick={close}>
              Continue browsing
            </button>
          </div>
        </>
      ) : (
        <div className="empty">
          <ShoppingBag size={30} />
          <h3>Your bag is empty</h3>
          <p>Find a piece from the latest drop.</p>
          <a href={shopLink()} onClick={close} className="btn dark">
            Explore the catalog
          </a>
        </div>
      )}
    </Dialog>
  );
}
