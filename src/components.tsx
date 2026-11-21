import { useEffect, useRef, useState, type ReactNode } from "react";
import { lazy, Suspense, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { useProducts } from "./CatalogSource";
import {
  asset,
  archiveEdits,
  money,
  shopLink,
  garmentPhoto,
  type Product,
} from "./store";

const EditorialMotion = lazy(() =>
  import("./EditorialMotion").catch(() => ({ default: () => null })),
);
const desktopMotion = matchMedia(
  "(min-width: 881px) and (prefers-reduced-motion: no-preference)",
);
function subscribeToMotion(listener: () => void) {
  desktopMotion.addEventListener("change", listener);
  return () => desktopMotion.removeEventListener("change", listener);
}

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
  const [requestPreview, setRequestPreview] = useState(false);
  const [loadedPreview, setLoadedPreview] = useState("");
  const primary = onModel ? p.image : garmentPhoto(p);
  const preview = onModel ? p.detail : p.image;
  return (
    <a
      className="product-card"
      href={"#/product/" + p.id}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setRequestPreview(true);
      }}
      onFocus={(e) => {
        if (e.currentTarget.matches(":focus-visible")) setRequestPreview(true);
      }}
    >
      <div className="product-photo">
        <img
          key={String(onModel)}
          width="640"
          height="800"
          loading="lazy"
          decoding="async"
          src={asset(primary)}
          alt={
            p.name +
            " in " +
            p.colors[0] +
            (primary === p.colorways[0].images.model
              ? ", on model"
              : primary === p.colorways[0].images.garment
                ? ", garment view"
                : ", fabric detail")
          }
        />
        {requestPreview && primary !== preview && (
          <img
            key={preview}
            className={
              "card-preview" + (loadedPreview === preview ? " ready" : "")
            }
            src={asset(preview)}
            alt=""
            decoding="async"
            onLoad={() => setLoadedPreview(preview)}
          />
        )}
      </div>
      <div className="product-caption">
        <h3>{p.name}</h3>
        <div className="color-dots" role="img" aria-label={p.colors.join(", ")}>
          {p.colors.map((c) => (
            <i
              key={c}
              style={{
                backgroundColor: p.colorways.find((w) => w.name === c)?.hex,
              }}
            />
          ))}
        </div>
      </div>
      <Price p={p} />
    </a>
  );
}

function CollectionIndex() {
  const [active, setActive] = useState(0);
  const panels = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting)
            setActive(panels.current.indexOf(entry.target as HTMLElement));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const panel of panels.current) if (panel) observer.observe(panel);
    return () => observer.disconnect();
  }, []);
  function goToPanel(index: number) {
    const panel = panels.current[index];
    if (!panel) return;
    panel.focus({ preventScroll: true });
    panel.scrollIntoView({
      block: "center",
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    setActive(index);
  }
  return (
    <section id="collections" className="section collection-index">
      <div className="collection-list">
        <p className="micro">Seasonal lookbook</p>
        <h2>Collections</h2>
        <div
          className="collection-tabs"
          role="group"
          aria-label="Collection index"
        >
          {archiveEdits.map((edit, i) => (
            <button
              key={edit.title}
              aria-current={active === i ? "location" : undefined}
              aria-controls={"look-" + i}
              onClick={() => goToPanel(i)}
            >
              <span>{edit.title}</span>
              <span aria-hidden="true">{active === i ? "−" : "+"}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="lookbook-frames">
        {archiveEdits.map((edit, i) => (
          <figure
            key={edit.title}
            id={"look-" + i}
            className="archive-image"
            tabIndex={-1}
            ref={(el) => {
              panels.current[i] = el;
            }}
            aria-label={edit.title}
          >
            <a
              className="lookbook-photo"
              href={shopLink({ edit: edit.title })}
              aria-label={"Shop " + edit.title}
            >
              <img loading="lazy" src={asset(edit.image)} alt={edit.alt} />
              <span className="photo-mask" aria-hidden="true" />
            </a>
            <figcaption>
              <div>
                <h3>{edit.title}</h3>
                <span>{edit.description}</span>
              </div>
              <a
                className="underlink"
                href={shopLink({ edit: edit.title })}
                aria-label={"Shop the " + edit.title + " edit"}
              >
                Shop the edit
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Home() {
  const products = useProducts();
  const sale = products.filter((p) => p.originalPrice);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const motion = useSyncExternalStore(
    subscribeToMotion,
    () => desktopMotion.matches,
  );
  return (
    <div ref={setRoot}>
      {motion && root && (
        <Suspense fallback={null}>
          <EditorialMotion root={root} />
        </Suspense>
      )}
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
            <span className="title-line">Soft</span>{" "}
            <span className="title-line">Structure</span>
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
        {!products.length && <p>No pieces have been published yet.</p>}
        <div className="grid">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
      <CollectionIndex />
      {sale.length > 0 && (
        <section className="section sale-strip">
          <div>
            <h2>On sale</h2>
            <p>
              Selected pieces from{" "}
              {money(Math.min(...sale.map((p) => p.price)))}.
            </p>
          </div>
          <div className="sale-images" aria-hidden="true">
            {sale.map((p) => (
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
      )}
    </div>
  );
}
