import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { products } from "./products";
import {
  asset,
  archiveEdits,
  money,
  shopLink,
  swatches,
  garmentPhoto,
  type Product,
} from "./store";

export function Logo() {
  return (
    <a href="#/" className="logo" aria-label="Shop City home">
      Shop City
    </a>
  );
}

export function Dialog({
  title,
  children,
  close,
  drawer = false,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const opener = document.activeElement;
    dialog.showModal();
    dialog.querySelector<HTMLElement>("[data-initial-focus]")?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus({ preventScroll: true });
      }
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={drawer ? "drawer" : "modal"}
      aria-label={title}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          close();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            close();
        }
      }}
    >
      <div className="dialog-head">
        <h2>{title}</h2>
        <button
          className="icon"
          aria-label={"Close " + title.toLowerCase()}
          onClick={close}
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function Price({ p }: { p: Product }) {
  return (
    <div className="price">
      <span className={p.originalPrice ? "discount" : ""}>
        {money(p.price)}
      </span>
      {p.originalPrice && <del>{money(p.originalPrice)}</del>}
    </div>
  );
}

export function ProductCard({
  p,
  onModel = false,
}: {
  p: Product;
  onModel?: boolean;
}) {
  return (
    <a className="product-card" href={"#/product/" + p.id}>
      <div className="product-photo">
        <img
          key={String(onModel)}
          width="640"
          height="800"
          loading="lazy"
          decoding="async"
          src={asset(onModel ? p.image : garmentPhoto(p))}
          alt={
            p.name +
            " in " +
            p.colors[0] +
            (onModel ? ", on model" : ", garment view")
          }
        />
      </div>
      <div className="product-caption">
        <h3>{p.name}</h3>
        <div className="color-dots" role="img" aria-label={p.colors.join(", ")}>
          {p.colors.map((c) => (
            <i key={c} style={{ backgroundColor: swatches[c] }} />
          ))}
        </div>
      </div>
      <Price p={p} />
    </a>
  );
}

function CollectionIndex() {
  const [index, setIndex] = useState(1);
  const current = archiveEdits[index];
  return (
    <section id="collections" className="section collection-index">
      <div className="collection-list">
        <p className="micro">Seasonal lookbook</p>
        <h2>Collections</h2>
        <div className="collection-tabs" aria-label="Collection previews">
          {archiveEdits.map((edit, i) => (
            <button
              key={edit.title}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            >
              <span>{edit.title}</span>
              <span aria-hidden="true">{i === index ? "−" : "+"}</span>
            </button>
          ))}
        </div>
      </div>
      <figure className="archive-image">
        <a
          href={shopLink({ edit: current.title })}
          aria-label={"Shop " + current.title}
        >
          <img
            key={index}
            loading="lazy"
            src={asset(current.image)}
            alt={current.alt}
          />
        </a>
        <figcaption>
          <span>{current.description}</span>
          <a className="underlink" href={shopLink({ edit: current.title })}>
            Shop the edit
          </a>
        </figcaption>
      </figure>
    </section>
  );
}

export function Home() {
  return (
    <>
      <section className="cover" aria-labelledby="campaign-title">
        <div className="cover-portrait">
          <img
            fetchPriority="high"
            width="1448"
            height="1086"
            src={asset("soft-structure.webp")}
            alt="An oversized sand canvas jacket and wide charcoal trousers in sunlit stone architecture"
          />
        </div>
        <div className="cover-copy">
          <span className="micro">Autumn / Winter 2026</span>
          <h1 id="campaign-title">
            Soft
            <br />
            Structure
          </h1>
          <a className="underlink" href={shopLink({ edit: "Soft Structure" })}>
            Explore the collection
          </a>
        </div>
        <div className="cover-detail">
          <img
            src={asset("cotton-study.webp")}
            width="1200"
            height="480"
            alt="Folds and a stitched seam in charcoal cotton twill"
          />
        </div>
      </section>
      <div className="cover-caption">
        <span>
          Shop City <i>/</i> Tashkent, Uzbekistan
        </span>
        <span>Canvas &amp; cotton twill</span>
      </div>
      <section className="section arrivals" id="arrivals">
        <div className="section-title">
          <h2>New arrivals</h2>
          <a className="underlink" href={shopLink()}>
            Shop all pieces
          </a>
        </div>
        <div className="grid">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
      <CollectionIndex />
      <section className="section sale-strip">
        <div>
          <h2>On sale</h2>
          <p>
            Selected pieces from{" "}
            {money(
              Math.min(
                ...products.filter((p) => p.originalPrice).map((p) => p.price),
              ),
            )}
            .
          </p>
        </div>
        <div className="sale-images" aria-hidden="true">
          {products
            .filter((p) => p.originalPrice)
            .map((p) => (
              <img
                loading="lazy"
                key={p.id}
                src={asset(garmentPhoto(p))}
                alt=""
              />
            ))}
        </div>
        <a className="underlink" href={shopLink({ sale: "1" })}>
          View sale
        </a>
      </section>
    </>
  );
}
