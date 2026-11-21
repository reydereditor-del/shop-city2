import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { readFile, access } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { fetchCatalog, mapProduct } from "../src/catalog-api.ts";
import { demoProducts } from "../src/demo-products.ts";

const db = new PGlite();
const file = (path) => new URL("../" + path, import.meta.url);
const seed = await readFile(file("supabase/seed.sql"), "utf8");
const feed = "select * from catalog_feed order by position,id";
const tables = [
  "categories",
  "colors",
  "sizes",
  "products",
  "colorways",
  "variants",
  "images",
].map((t) => "catalog_" + t);
before(async () => {
  await db.exec("create role anon; create role authenticated;");
  // Hosted projects can have broad default grants on newly created tables.
  await db.exec(
    "alter default privileges in schema public grant all on tables to anon, authenticated;",
  );
  await db.exec(
    await readFile(
      file("supabase/migrations/20261121000100_catalog.sql"),
      "utf8",
    ),
  );
  await db.exec(seed);
});
after(() => db.close());

test("seeded public feed preserves eight products, every price, size, color and image", async () => {
  await db.transaction(async (tx) => {
    await tx.exec("set local role anon");
    const { rows } = await tx.query(feed);
    assert.equal(rows.length, 8);
    for (const [i, row] of rows.entries()) {
      const product = mapProduct(row),
        demo = demoProducts[i];
      for (const key of [
        "id",
        "name",
        "category",
        "categoryPosition",
        "description",
        "price",
        "originalPrice",
        "colors",
        "image",
        "detail",
      ])
        assert.deepEqual(product[key], demo[key]);
      for (const [j, way] of product.colorways.entries()) {
        assert.deepEqual(way.images, demo.colorways[j].images);
        assert.equal(way.hex, demo.colorways[j].hex);
        assert.deepEqual(
          way.variants.map((v) => v.size),
          ["S", "M", "L", "XL"],
        );
        for (const v of way.variants) {
          assert.equal(v.stock, 10);
          assert.match(v.id, /^[0-9a-f-]{36}$/);
        }
        for (const path of Object.values(way.images))
          await access(file("public/images/" + path));
      }
    }
  });
});

test("all catalog tables have RLS and both browser roles have read-only privileges", async () => {
  for (const role of ["anon", "authenticated"]) {
    for (const table of tables) {
      const {
        rows: [row],
      } = await db.query(
        "select relrowsecurity as rls,has_table_privilege($1,oid,'SELECT') as readable,has_table_privilege($1,oid,'INSERT,UPDATE,DELETE,TRUNCATE') as writable from pg_class where oid=$2::regclass",
        [role, table],
      );
      assert.deepEqual(
        row,
        { rls: true, readable: true, writable: false },
        table,
      );
    }
    for (const sql of [
      "insert into catalog_sizes(name) values ('TEST')",
      "update catalog_products set published=false",
      "delete from catalog_variants",
    ]) {
      await assert.rejects(
        db.transaction(async (tx) => {
          await tx.exec("set local role " + role);
          await tx.exec(sql);
        }),
        { code: "42501" },
      );
    }
  }
});

test("draft parents, variants, sizes and images are filtered even through the feed", async () => {
  for (const [table, descendants] of [
    ["categories", ["products", "colorways", "variants", "images", "feed"]],
    ["products", ["colorways", "variants", "images", "feed"]],
    ["colors", ["colorways", "variants", "images", "feed"]],
    ["colorways", ["variants", "images", "feed"]],
    ["sizes", ["variants", "feed"]],
    ["variants", ["feed"]],
    ["images", ["feed"]],
  ]) {
    await db.transaction(async (tx) => {
      await tx.exec(
        "update catalog_" +
          table +
          " set published=false; set local role anon;",
      );
      for (const relation of [table, ...descendants]) {
        assert.equal(
          (
            await tx.query(
              "select count(*)::int as count from catalog_" + relation,
            )
          ).rows[0].count,
          0,
          table + " -> " + relation,
        );
      }
      await tx.exec(
        "reset role; update catalog_" + table + " set published=true",
      );
    });
  }
});

test("a hidden size or photo disappears without removing the remaining published product", async () => {
  await db.transaction(async (tx) => {
    await tx.exec(
      "update catalog_sizes set published=false where name='M';update catalog_images set published=false where kind='detail';set local role anon",
    );
    const { rows } = await tx.query(feed);
    assert.equal(rows.length, 8);
    for (const product of rows.map(mapProduct)) {
      for (const way of product.colorways) {
        assert.equal(way.images.detail, undefined);
        assert.deepEqual(
          way.variants.map((v) => v.size),
          ["S", "L", "XL"],
        );
      }
    }
    await tx.exec(
      "reset role; update catalog_sizes set published=true;update catalog_images set published=true",
    );
  });
});

test("invalid prices, negative inventory and duplicate variants or SKUs are rejected", async () => {
  for (const sql of [
    "update catalog_products set sale_uzs=price_uzs",
    "update catalog_variants set stock=-1",
    "insert into catalog_variants(colorway_id,size_id,sku) select colorway_id,size_id,'another-sku' from catalog_variants limit 1",
    "update catalog_variants set sku='duplicate'",
  ])
    await assert.rejects(db.exec(sql), (e) =>
      ["23514", "23505"].includes(e.code),
    );
});

test("repeat seeding preserves IDs, stock, prices and publication decisions", async () => {
  const before = (await db.query("select id from catalog_variants order by id"))
    .rows;
  await db.exec(
    "update catalog_products set price_uzs=630000,published=false where slug='transit-bomber'; update catalog_variants set stock=3 where sku='transit-bomber-1-S'",
  );
  await db.exec(seed);
  assert.deepEqual(
    (await db.query("select id from catalog_variants order by id")).rows,
    before,
  );
  assert.equal(before.length, 64);
  assert.deepEqual(
    (
      await db.query(
        "select price_uzs,published from catalog_products where slug='transit-bomber'",
      )
    ).rows,
    [{ price_uzs: 630000, published: false }],
  );
  assert.equal(
    (
      await db.query(
        "select stock from catalog_variants where sku='transit-bomber-1-S'",
      )
    ).rows[0].stock,
    3,
  );
  assert.equal(
    (await db.query("select count(*)::int as count from catalog_images"))
      .rows[0].count,
    40,
  );
  await db.exec(
    "update catalog_products set price_uzs=629000,published=true where slug=\x27transit-bomber\x27; update catalog_variants set stock=10 where sku=\x27transit-bomber-1-S\x27",
  );
});

test("Data API adapter pages past server limits, uses the public key and maps real feed rows", async () => {
  const offsets = [];
  const signal = new AbortController().signal;
  const result = await fetchCatalog(
    "https://shop.example",
    "public-test-key",
    signal,
    async (url, options) => {
      assert.equal(url.pathname, "/rest/v1/catalog_feed");
      assert.equal(url.searchParams.get("order"), "position.asc,id.asc");
      assert.equal(options.headers.apikey, "public-test-key");
      assert.equal(options.signal, signal);
      assert.equal(options.credentials, "omit");
      const offset = Number(url.searchParams.get("offset"));
      offsets.push(offset);
      const { rows } = await db.query(feed + " limit 3 offset $1", [offset]);
      return Response.json(rows);
    },
  );
  assert.deepEqual(offsets, [0, 3, 6, 8]);
  assert.equal(result.length, 8);
});

test("adapter handles empty and failed reads and rejects malformed data", async () => {
  const read = (response) =>
    fetchCatalog(
      "https://shop.example",
      "test",
      new AbortController().signal,
      async () => response,
    );
  assert.deepEqual(await read(Response.json([])), []);
  await assert.rejects(read(new Response(null, { status: 503 })), /503/);
  await assert.rejects(read(Response.json({})), /Invalid catalog response/);
  const {
    rows: [row],
  } = await db.query(feed);
  assert.throws(
    () => mapProduct({ ...row, sale_uzs: row.price_uzs }),
    /sale price/,
  );
  assert.throws(
    () => mapProduct({ ...row, colorways: [] }),
    /Incomplete product/,
  );
  assert.throws(
    () =>
      mapProduct({
        ...row,
        colorways: [{ ...row.colorways[0], images: { model: "../private" } }],
      }),
    /image/,
  );
});
