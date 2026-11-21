import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchCatalog, type Product } from "./catalog-api";

const CatalogContext = createContext<Product[] | null>(null);
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const demoMode = !url && !key;

export function useProducts(): Product[] {
  const products = useContext(CatalogContext);
  if (!products) throw Error("Catalog provider is required");
  return products;
}

export function CatalogSource({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    const load = demoMode
      ? import("./demo-products").then((m) => m.demoProducts)
      : fetchCatalog(url, key, controller.signal);
    load
      .then(
        (rows) => {
          if (current) setProducts(rows);
        },
        () => {
          if (current) setFailed(true);
        },
      )
      .finally(() => window.clearTimeout(timeout));
    return () => {
      current = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);
  if (products)
    return (
      <CatalogContext.Provider value={products}>
        {children}
      </CatalogContext.Provider>
    );
  return (
    <main className="section empty">
      <p className="micro">Shop City · Tashkent</p>
      <h1 role="status">
        {failed ? "Catalog temporarily unavailable" : "Loading the collection…"}
      </h1>
      {failed && (
        <>
          <p>Your saved bag is kept on this device.</p>
          <button
            className="btn dark"
            onClick={() => {
              setFailed(false);
              setAttempt((n) => n + 1);
            }}
          >
            Try again
          </button>
        </>
      )}
    </main>
  );
}
