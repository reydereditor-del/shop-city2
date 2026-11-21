import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_");
  const url = env.VITE_SUPABASE_URL,
    key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (mode === "cloudflare" || url || key) {
    if (!url || !key?.startsWith("sb_publishable_"))
      throw Error(
        "Set VITE_SUPABASE_URL and a Supabase sb_publishable_ browser key.",
      );
    const origin = new URL(url);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(
      origin.hostname,
    );
    if (
      (origin.protocol !== "https:" &&
        !(loopback && origin.protocol === "http:" && mode !== "cloudflare")) ||
      origin.username ||
      origin.password ||
      origin.search ||
      origin.hash ||
      origin.pathname !== "/"
    )
      throw Error(
        "Use the HTTPS project origin without credentials or path (HTTP loopback is allowed locally).",
      );
  }
  return {
    base: mode === "cloudflare" ? "/" : "/shop-city2/",
    plugins: [react()],
  };
});
