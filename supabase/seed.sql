-- Sample inventory only. Existing product graphs and merchant edits are preserved.
begin;
select pg_advisory_xact_lock(729601104);
insert into public.catalog_categories (name,position,published) values
  ('T-shirts',0,true),
  ('Pants',1,true),
  ('Hoodies',2,true),
  ('Jackets',3,true) on conflict (name) do nothing;
insert into public.catalog_sizes (name,position,published) values
  ('S',0,true),('M',1,true),('L',2,true),('XL',3,true) on conflict (name) do nothing;
insert into public.catalog_colors (name,hex,published) values
  ('Black','#242426',true),
  ('Olive','#61624b',true),
  ('Bone','#e9e4d8',true),
  ('Slate','#686966',true),
  ('Indigo','#303846',true),
  ('Ash','#b7b6b2',true),
  ('Sand','#b5a284',true),
  ('Charcoal','#4e4d4a',true),
  ('Oxblood','#682c35',true) on conflict (name) do nothing;

do $seed$
declare
  sample record;
  product_key uuid;
  color_key uuid;
  color_index integer;
  stem text;
begin
  for sample in select * from (values
    ('transit-bomber', 'Transit Shell Bomber', 'Jackets', 'Matte nylon gives this boxy bomber a crisp outline. Ribbed edges gather the sleeves and hem, with angled pockets set into the front.', 629000, null::integer, 0, array['Black', 'Olive']),
    ('wash-tee', 'Washed Oversized Tee', 'T-shirts', 'A faded wash brings out the grain of the cotton jersey. Wide sleeves fall to the elbow, while the straight hem sits loose over denim.', 319000, null::integer, 1, array['Slate', 'Bone']),
    ('volume-jeans', 'Volume Baggy Denim', 'Pants', 'Deep indigo denim with a roomy rise and a generous straight leg. Tobacco stitching traces the pockets and the hem stacks over the shoe.', 499000, null::integer, 2, array['Indigo', 'Black']),
    ('loft-hoodie', 'Loft Fleece Hoodie', 'Hoodies', 'Textured fleece with dropped shoulders and a roomy hood. A wide front pocket keeps the shape relaxed through the body.', 459000, null::integer, 3, array['Ash', 'Black']),
    ('canvas-chore', 'Canvas Chore Jacket', 'Jackets', 'A short cotton canvas jacket cut wide enough to layer over a sweatshirt. Two oversized patch pockets sit flush against the front.', 579000, null::integer, 4, array['Sand', 'Charcoal']),
    ('field-cargo', 'Field Cargo Trousers', 'Pants', 'Soft cotton twill falls in a broad line from hip to ankle. Low-set cargo pockets give the leg extra room without breaking its silhouette.', 429000, null::integer, 5, array['Olive', 'Sand']),
    ('pocket-tee', 'Box Pocket Tee', 'T-shirts', 'An easy crewneck in smooth, substantial jersey. A single square chest pocket balances its broad shoulders and roomy sleeves.', 309000, 99000, 6, array['Bone', 'Charcoal']),
    ('loopback-crew', 'Loopback Crewneck', 'Hoodies', 'A drop-shoulder sweatshirt in dense loopback cotton. Wide ribbed cuffs and a gathered hem give its relaxed body a rounded profile.', 399000, 239000, 7, array['Oxblood', 'Ash'])
  ) as items(slug,name,category,description,regular,sale,position,colors)
  loop
    insert into public.catalog_products (slug,name,category_id,description,price_uzs,sale_uzs,position,published)
    select sample.slug,sample.name,c.id,sample.description,sample.regular,sample.sale,sample.position,true
    from public.catalog_categories c where c.name=sample.category
    on conflict (slug) do nothing returning id into product_key;
    if product_key is null then continue; end if;
    for color_index in 1..array_length(sample.colors,1) loop
      insert into public.catalog_colorways (product_id,color_id,position,published)
      select product_key,c.id,color_index,true from public.catalog_colors c where c.name=sample.colors[color_index]
      returning id into color_key;
      insert into public.catalog_variants (colorway_id,size_id,sku,stock,published)
      select color_key,s.id, sample.slug || '-' || color_index || '-' || s.name, 10, true
      from public.catalog_sizes s where s.name in ('S','M','L','XL');
      stem := 'product-' || sample.slug || case when color_index=1 then '' else '-alt' end;
      insert into public.catalog_images (colorway_id,kind,source,published) values
        (color_key,'model',stem || '.webp',true),(color_key,'detail',stem || '-detail.webp',true);
      if color_index=1 then
        insert into public.catalog_images (colorway_id,kind,source,published)
        values (color_key,'garment','garment-' || sample.slug || '.webp',true);
      end if;
    end loop;
  end loop;
end
$seed$;
commit;
