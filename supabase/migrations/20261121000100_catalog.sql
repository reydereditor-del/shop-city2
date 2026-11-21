-- Run as the migration owner on PostgreSQL 15+. All mutations are server-side.
begin;

create table public.catalog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (btrim(name) = name and name <> ''),
  position integer not null default 0 check (position >= 0),
  published boolean not null default false
);

create table public.catalog_colors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (btrim(name) = name and name <> ''),
  hex text not null check (hex ~ '^#[0-9A-Fa-f]{6}$'),
  position integer not null default 0 check (position >= 0),
  published boolean not null default false
);

create table public.catalog_sizes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (btrim(name) = name and name <> ''),
  position integer not null default 0 check (position >= 0),
  published boolean not null default false
);

create table public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid not null references public.catalog_categories,
  name text not null check (btrim(name) <> ''),
  description text not null default '',
  price_uzs integer not null check (price_uzs > 0),
  sale_uzs integer check (sale_uzs > 0 and sale_uzs < price_uzs),
  position integer not null default 0 check (position >= 0),
  published boolean not null default false
);

create table public.catalog_colorways (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.catalog_products,
  color_id uuid not null references public.catalog_colors,
  position integer not null default 0 check (position >= 0),
  published boolean not null default false,
  unique (product_id, color_id)
);

create table public.catalog_variants (
  id uuid primary key default gen_random_uuid(),
  colorway_id uuid not null references public.catalog_colorways,
  size_id uuid not null references public.catalog_sizes,
  sku text not null unique check (btrim(sku) <> ''),
  stock integer not null default 0 check (stock >= 0),
  published boolean not null default false,
  unique (colorway_id, size_id)
);

create table public.catalog_images (
  id uuid primary key default gen_random_uuid(),
  colorway_id uuid not null references public.catalog_colorways,
  kind text not null check (kind in ('model','garment','detail')),
  source text not null check (source ~ '^[A-Za-z0-9_-]+[.](webp|avif|png|jpg|jpeg)$' or source ~ '^https://[^[:space:]]+$'),
  published boolean not null default false,
  unique (colorway_id, kind)
);

create index catalog_products_category_idx on public.catalog_products(category_id);
create index catalog_products_feed_idx on public.catalog_products(position, id) where published;
create index catalog_colorways_color_idx on public.catalog_colorways(color_id);
create index catalog_variants_size_idx on public.catalog_variants(size_id);

alter table public.catalog_categories enable row level security;
alter table public.catalog_colors enable row level security;
alter table public.catalog_sizes enable row level security;
alter table public.catalog_products enable row level security;
alter table public.catalog_colorways enable row level security;
alter table public.catalog_variants enable row level security;
alter table public.catalog_images enable row level security;

-- Supabase projects may have broad default grants. Remove those explicitly.
revoke all on public.catalog_categories,
  public.catalog_colors,
  public.catalog_sizes,
  public.catalog_products,
  public.catalog_colorways,
  public.catalog_variants,
  public.catalog_images from public, anon, authenticated;
grant select on public.catalog_categories,
  public.catalog_colors,
  public.catalog_sizes,
  public.catalog_products,
  public.catalog_colorways,
  public.catalog_variants,
  public.catalog_images to anon, authenticated;

create policy read_published on public.catalog_categories for select to anon, authenticated using (published);
create policy read_published on public.catalog_colors for select to anon, authenticated using (published);
create policy read_published on public.catalog_sizes for select to anon, authenticated using (published);

-- The parent lookups also pass through their own RLS policies.
create policy read_published on public.catalog_products for select to anon, authenticated
using (published and exists (select 1 from public.catalog_categories c where c.id = category_id));
create policy read_published on public.catalog_colorways for select to anon, authenticated
using (published and exists (select 1 from public.catalog_products p where p.id = product_id)
                 and exists (select 1 from public.catalog_colors c where c.id = color_id));
create policy read_published on public.catalog_variants for select to anon, authenticated
using (published and exists (select 1 from public.catalog_colorways w where w.id = colorway_id)
                 and exists (select 1 from public.catalog_sizes s where s.id = size_id));
create policy read_published on public.catalog_images for select to anon, authenticated
using (published and exists (select 1 from public.catalog_colorways w where w.id = colorway_id));

-- One read-consistent product per row. Invoker security preserves table RLS.
create view public.catalog_feed with (security_invoker = true) as
select p.id, p.slug, p.name, p.description, p.price_uzs, p.sale_uzs, p.position,
       cat.name as category, cat.position as category_position, options.colorways
from public.catalog_products p
join public.catalog_categories cat on cat.id = p.category_id
cross join lateral (
  select jsonb_agg(jsonb_build_object('name', c.name, 'hex', c.hex,
    'images', photos.images, 'variants', stock.variants) order by w.position, w.id) as colorways
  from public.catalog_colorways w
  join public.catalog_colors c on c.id = w.color_id
  cross join lateral (
    select jsonb_object_agg(i.kind, i.source) as images from public.catalog_images i where i.colorway_id = w.id
  ) photos
  cross join lateral (
    select jsonb_agg(jsonb_build_object('id', v.id, 'size', s.name, 'stock', v.stock)
      order by s.position, s.name) as variants
    from public.catalog_variants v join public.catalog_sizes s on s.id = v.size_id
    where v.colorway_id = w.id
  ) stock
  where w.product_id = p.id and photos.images is not null and stock.variants is not null
) options
where options.colorways is not null;

revoke all on public.catalog_feed from public, anon, authenticated;
grant select on public.catalog_feed to anon, authenticated;
commit;
