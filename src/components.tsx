import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Grid2X2, Plus, X } from "lucide-react";
import { products } from "./products";
import { asset, edits, money, shopLink, type Product } from "./store";

export function Logo() {
  return (
    <a href="#/" className="logo" aria-label="Shop City home">
      <i aria-hidden="true">///</i>SHOPCITY<span>.</span>
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
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={drawer ? "drawer" : "modal"}
      aria-label={title}
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
export function ProductCard({ p, fresh }: { p: Product; fresh?: boolean }) {
  const [ready, setReady] = useState(false);
  return (
    <a className="product-card" href={"#/product/" + p.id}>
      <div className={"product-photo" + (ready ? "" : " pending")}>
        <img
          width="600"
          height="750"
          loading="lazy"
          decoding="async"
          onLoad={() => setReady(true)}
          src={asset(p.image)}
          alt={p.name + " in " + p.colors[0]}
        />
        {p.originalPrice ? (
          <span className="tag sale-tag">
            −{Math.round((1 - p.price / p.originalPrice) * 100)}%
          </span>
        ) : (
          fresh && <span className="tag">New</span>
        )}
        <span className="card-plus">
          <Plus size={18} />
        </span>
      </div>
      <div className="card-meta">
        <span>{p.category}</span>
        <span>
          {p.colors.length} {p.colors.length === 1 ? "color" : "colors"}
        </span>
      </div>
      <h3>{p.name}</h3>
      <Price p={p} />
    </a>
  );
}

export function Home() {
  const [frame, setFrame] = useState(0);
  const edit = edits[frame];
  return (
    <>
      <section
        className="hero"
        aria-label="Seasonal campaigns"
        aria-roledescription="carousel"
      >
        <img
          key={"img" + frame}
          className="hero-image"
          fetchPriority="high"
          src={asset("campaign-" + frame + ".webp")}
          alt={edit.alt}
        />
        <div className="hero-shade" />
        <div className="hero-inner" key={frame} aria-live="polite">
          <div className="hero-kicker">
            <span className="red-line" />
            {edit.label}
          </div>
          <h1>
            {edit.lines[0]}
            <br />
            {edit.lines[1]}
          </h1>
          <p>{edit.description}</p>
          <a className="btn light" href={shopLink({ edit: edit.title })}>
            Shop the edit
          </a>
        </div>
        <div className="hero-foot">
          <div className="frame-location">
            <span className="target" aria-hidden="true" /> Tashkent, Uzbekistan
          </div>
          <div className="frame-controls">
            <span className="counter">
              0{frame + 1} <i>/ 03</i>
            </span>
            <button
              aria-label="Previous campaign"
              onClick={() => setFrame((frame + 2) % 3)}
            >
              <ArrowLeft size={17} />
            </button>
            <button
              aria-label="Next campaign"
              onClick={() => setFrame((frame + 1) % 3)}
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>
      <section className="section" id="arrivals">
        <div className="section-title">
          <div>
            <div className="eyebrow">
              <b />
              Latest drop
            </div>
            <h2>New arrivals</h2>
          </div>
          <a className="text-link" href={shopLink()}>
            <Grid2X2 size={14} /> Shop all
          </a>
        </div>
        <div className="grid">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} p={p} fresh />
          ))}
        </div>
      </section>
      <section className="section collections" id="collections">
        <div className="section-title">
          <div>
            <div className="eyebrow">
              <b />
              Seasonal selection
            </div>
            <h2>The collections</h2>
          </div>
        </div>
        <div className="edit-grid">
          {edits.slice(1).map((e, i) => (
            <a
              href={shopLink({ edit: e.title })}
              className="edit-tile"
              key={e.title}
            >
              <img
                loading="lazy"
                src={asset("campaign-" + (i + 1) + ".webp")}
                alt={e.alt}
              />
              <div>
                <span>{e.label}</span>
                <h3>{e.title}</h3>
                <u>Shop collection</u>
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
