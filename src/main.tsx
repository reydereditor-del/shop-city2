import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Menu, Search, ShoppingBag } from "lucide-react";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource-variable/dm-sans/wght.css";
import "./style.css";
import { Home, Logo, Dialog } from "./components";
import { Catalog } from "./Catalog";
import { ProductView } from "./ProductView";
import { SearchPanel, BagPanel } from "./Overlays";
import { products } from "./products";
import { readBag, storageKey, itemKey, type CartItem } from "./store";

const navigation = [
  ["Shop all", "#/shop"],
  ["New arrivals", "#/arrivals"],
  ["Collections", "#/collections"],
  ["Sale", "#/shop?sale=1"],
];
function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || "/");
  const [panel, setPanel] = useState<null | "bag" | "menu" | "search">(null);
  const [items, setItems] = useState<CartItem[]>(readBag);
  const [addedKey, setAddedKey] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [path, search = ""] = route.split("?");
  const params = new URLSearchParams(search);
  const product = path.startsWith("/product/")
    ? products.find((p) => p.id === path.slice(9))
    : undefined;
  const home = ["/", "/arrivals", "/collections"].includes(path);
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  const listingContext =
    path === "/shop"
      ? params.get("edit") || params.get("sale") || params.get("q") || ""
      : "";
  useEffect(() => {
    const navigate = () => {
      setRoute(location.hash.slice(1) || "/");
      setPanel(null);
    };
    const sync = (e: StorageEvent) => {
      if (e.key === storageKey || e.key === null) setItems(readBag());
    };
    window.addEventListener("hashchange", navigate);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hashchange", navigate);
      window.removeEventListener("storage", sync);
    };
  }, []);
  useEffect(() => {
    const anchor =
      path === "/arrivals" || path === "/collections"
        ? document.getElementById(path.slice(1))
        : null;
    const target = anchor || main.current;
    if (target && !first.current) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
    if (anchor)
      anchor.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    else window.scrollTo({ top: 0, behavior: "instant" });
    first.current = false;
  }, [path, listingContext]);
  useEffect(() => {
    const label =
      product?.name ||
      (path === "/shop"
        ? params.get("edit") || (params.has("sale") ? "Sale" : "Catalog")
        : "Tashkent Streetwear");
    document.title = label + " — Shop City";
  }, [route, product]);
  function save(next: CartItem[]) {
    setItems(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }
  function add(item: CartItem) {
    const key = itemKey(item),
      existing = items.find((i) => itemKey(i) === key);
    save(
      existing
        ? items.map((i) =>
            itemKey(i) === key ? { ...i, qty: Math.min(99, i.qty + 1) } : i,
          )
        : [...items, item],
    );
    setAddedKey(key);
    setPanel("bag");
  }
  const count = items.reduce((n, i) => n + i.qty, 0);
  function navLink([label, url]: string[]) {
    return (
      <a
        key={url}
        href={url}
        aria-current={"#" + route === url ? "page" : undefined}
        className={label === "Sale" ? "sale-nav" : ""}
        onClick={() => {
          setPanel(null);
          if ("#" + route === url) {
            if (home && path !== "/")
              document.getElementById(path.slice(1))?.scrollIntoView();
            else window.scrollTo(0, 0);
          }
        }}
      >
        {label}
      </a>
    );
  }
  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="header">
        <button
          className="mobile-menu"
          aria-label="Open navigation"
          onClick={() => setPanel("menu")}
        >
          <Menu size={21} />
        </button>
        <Logo />
        <nav aria-label="Main navigation">{navigation.map(navLink)}</nav>
        <div className="utilities">
          <button onClick={() => setPanel("search")} aria-label="Search store">
            <Search size={18} />
            <span>Search</span>
          </button>
          <button
            onClick={() => {
              setAddedKey(null);
              setPanel("bag");
            }}
            aria-label={"Shopping bag, " + count + " items"}
          >
            <ShoppingBag size={18} />
            <span>Bag</span>
            <b>({count})</b>
          </button>
        </div>
      </header>
      <main id="main" ref={main} tabIndex={-1}>
        {home ? (
          <Home />
        ) : path === "/shop" ? (
          <Catalog params={params} />
        ) : product ? (
          <ProductView key={product.id} p={product} add={add} />
        ) : (
          <div className="empty">
            <h1>Piece not found</h1>
            <a className="btn dark" href="#/shop">
              Explore the catalog
            </a>
          </div>
        )}
      </main>
      <footer>
        <div>
          <Logo />
          <span>Tashkent, Uzbekistan</span>
        </div>
        <p>
          Storefront demo · Fictional products and sample prices in UZS.
          <br />
          Payments and order fulfillment are unavailable.
        </p>
        <a href="#/shop">Shop the catalog</a>
      </footer>
      {saveError && (
        <p role="status" className="storage-note">
          Browser storage is unavailable. Your bag will last for this visit.
        </p>
      )}
      {panel === "menu" && (
        <Dialog title="Menu" drawer close={() => setPanel(null)}>
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {navigation.map(navLink)}
          </nav>
        </Dialog>
      )}
      {panel === "search" && <SearchPanel close={() => setPanel(null)} />}
      {panel === "bag" && (
        <BagPanel
          items={items}
          addedKey={addedKey}
          close={() => setPanel(null)}
          change={(key, n) => {
            setAddedKey(null);
            save(
              items.flatMap((i) =>
                itemKey(i) !== key ? [i] : n > 0 ? [{ ...i, qty: n }] : [],
              ),
            );
          }}
        />
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
