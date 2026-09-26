-- Aditya Polymers — seed data (migration 0002)
-- Mirrors content/catalog.ts. Spec values stay null until client TDS arrives.

-- Categories ---------------------------------------------------------------
insert into categories (slug, parent_id, name, short_name, description, sort_order) values
  ('synthetic', null, 'Synthetic Adhesives', 'Synthetic',
   'PVA/VAM-based synthetic adhesives for textile tubes, paper conversion and food-grade packaging, manufactured under the Dr Bond brand.', 1),
  ('packaging', null, 'Packaging Adhesives', 'Packaging',
   'Paper conversion, lamination, labeling and starch-based (dextrin) adhesives for corrugated boxes, paper tubes and cores, composite cans and fibre drums.', 2),
  ('paper-conversion', (select id from categories where slug = 'packaging'), 'Paper Conversion Adhesives', 'Paper Conversion',
   'Synthetic homopolymer adhesives for paper-to-paper pasting across paper and textile tubes, agarbatti tubes, mailing tubes, composite cans and fibre drums. Customised grades developed against customer requirement.', 3),
  ('lamination', (select id from categories where slug = 'packaging'), 'Lamination Adhesives', 'Lamination',
   'Temperature-resistant, solvent-free lamination adhesives that stick quickly even to rough surfaces — including high-speed E-fluting lamination machines.', 4),
  ('labeling', (select id from categories where slug = 'packaging'), 'Labeling Adhesives', 'Labeling',
   'Labeling adhesives for the packaging industry that stick to paper, metal and other surfaces, available in various sizes, shapes and colours.', 5),
  ('starch-based-dextrin', (select id from categories where slug = 'packaging'), 'Starch Based Adhesives (Dextrin)', 'Starch / Dextrin',
   'Cold-mix and hot-mix dextrin grades for paper tubes, cores, edge guards and fibre drums, plus pasting and corrugation grades for carton making.', 6),
  ('wood-working', null, 'Wood Working & Furniture Adhesives', 'Wood Working',
   'Furniture-grade PVA adhesives from premium to general purpose, including a water-resistant grade for demanding joinery.', 7);

-- Products -----------------------------------------------------------------
insert into products (category_id, slug, sku, name, brand, short_description, description, applications, specs, is_retail_pack) values
  ((select id from categories where slug='synthetic'), 'ap-450', 'AP-450', 'Dr Bond AP-450', 'Dr Bond', '', '', 'Textile tubes', '{"base":"PVA/VAM"}', false),
  ((select id from categories where slug='synthetic'), 'k-41', 'K-41', 'Dr Bond K-41', 'Dr Bond', '', '', 'Textile tube top paper (GP/VP) and carton side pasting', '{"base":"PVA/VAM"}', false),
  ((select id from categories where slug='synthetic'), 'k-30', 'K-30', 'Dr Bond K-30', 'Dr Bond', '', '', 'Low-cost adhesive for textile and small paper tubes', '{"base":"PVA/VAM"}', false),
  ((select id from categories where slug='synthetic'), 'bp-2500', 'BP 2500', 'Dr Bond BP 2500', 'Dr Bond', '', '', 'VP/GP paper tubes — high solid, low viscosity', '{"base":"PVA/VAM"}', false),
  ((select id from categories where slug='synthetic'), 'ap-42', 'AP-42', 'Dr Bond AP-42', 'Dr Bond', '', '', 'E-fluting laminators; food-grade packaging', '{"base":"PVA/VAM"}', false),
  ((select id from categories where slug='starch-based-dextrin'), 'cl-150', 'CL 150', 'Dr Bond CL 150', 'Dr Bond', '', 'Quality tested on solid content, viscosity, pH and film properties.', 'Paper tubes, paper cores, edge guards, fibre drums — cold mixing, no cooking or heating required', '{"base":"Starch / dextrin"}', false),
  ((select id from categories where slug='starch-based-dextrin'), 'dexo-3000', 'DEXO 3000', 'Dr Bond DEXO 3000', 'Dr Bond', '', '', 'Paper tubes and paper cores — hot mixing grade (cooking equipment required)', '{"base":"Starch / dextrin"}', false),
  ((select id from categories where slug='starch-based-dextrin'), 'dexo-4000', 'DEXO 4000', 'Dr Bond DEXO 4000', 'Dr Bond', '', '', 'Paper tubes and paper cores — hot mixing grade (cooking equipment required)', '{"base":"Starch / dextrin"}', false),
  ((select id from categories where slug='starch-based-dextrin'), 'dexo-7000', 'DEXO 7000', 'Dr Bond DEXO 7000', 'Dr Bond', '', '', 'Textile tubes — hot mixing grade (cooking equipment required)', '{"base":"Starch / dextrin"}', false),
  ((select id from categories where slug='starch-based-dextrin'), 'pasting-30', 'PASTING 30', 'Dr Bond PASTING 30', 'Dr Bond', '', '', 'Corrugation in corrugated carton and box making', '{"base":"Starch / dextrin"}', false),
  ((select id from categories where slug='starch-based-dextrin'), 'pasting-35', 'PASTING 35', 'Dr Bond PASTING 35', 'Dr Bond', '', '', 'Corrugation in corrugated carton and box making', '{"base":"Starch / dextrin"}', false),
  ((select id from categories where slug='starch-based-dextrin'), 'pasting-40', 'PASTING 40', 'Dr Bond PASTING 40', 'Dr Bond', '', '', 'Corrugation in corrugated carton and box making', '{"base":"Starch / dextrin"}', false),
  ((select id from categories where slug='starch-based-dextrin'), 'corrugation-30', 'CORRUGATION 30', 'Dr Bond CORRUGATION 30', 'Dr Bond', '', '', 'Pasting in box making', '{"base":"Starch / dextrin"}', false),
  ((select id from categories where slug='starch-based-dextrin'), 'corrugation-35', 'CORRUGATION 35', 'Dr Bond CORRUGATION 35', 'Dr Bond', '', '', 'Pasting in box making', '{"base":"Starch / dextrin"}', false),
  ((select id from categories where slug='starch-based-dextrin'), 'corrugation-40', 'CORRUGATION 40', 'Dr Bond CORRUGATION 40', 'Dr Bond', '', '', 'Pasting in box making', '{"base":"Starch / dextrin"}', false),
  ((select id from categories where slug='wood-working'), 'ap-44', 'AP 44', 'Dr Bond AP 44', 'Dr Bond', '', '', 'Premium grade for interior decoration, wood working and joinery', '{"base":"PVA","solids_pct":44}', true),
  ((select id from categories where slug='wood-working'), 'ap-38', 'AP 38', 'Dr Bond AP 38', 'Dr Bond', '', '', 'High grade for carpenters and interior decorators', '{"base":"PVA","solids_pct":38}', true),
  ((select id from categories where slug='wood-working'), 'ap-32', 'AP 32', 'Dr Bond AP 32', 'Dr Bond', '', '', 'Medium grade for general purpose furniture and wood working; domestic uses', '{"base":"PVA","solids_pct":32}', true),
  ((select id from categories where slug='wood-working'), 'wr-50', 'WR 50', 'Dr Bond WR 50', 'Dr Bond', '', '', 'Water-resistant applications in the furniture industry', '{"base":"PVA","solids_pct":50,"water_resistant":true}', true);

-- Industries ---------------------------------------------------------------
insert into industries (slug, name, summary, sort_order) values
  ('paper-tubes-and-cores', 'Paper Tubes & Cores', 'Adhesives for paper tubes and cores across high-speed yarn winding (POY, FDY, DTY), agarbatti tubes, mailing tubes and cores for polyester and BOPP films.', 1),
  ('corrugated-boxes', 'Corrugated Boxes & Boards', 'Pasting and corrugation grades plus synthetic side-pasting adhesives for corrugated carton and box making.', 2),
  ('composite-cans', 'Composite & Combi Cans', 'Adhesives for composite and combi can manufacture.', 3),
  ('fibre-drums', 'Fibre Drums (Pharma & Chemical)', 'Square fibre drum adhesives for the pharma and chemical industries — a capability claimed as a first in India.', 4),
  ('lamination', 'Lamination', 'Temperature-resistant, solvent-free lamination including high-speed E-fluting machines.', 5),
  ('labeling', 'Labeling', 'Labeling adhesives for paper, metal and other surfaces across the packaging industry.', 6),
  ('furniture-post-forming', 'Furniture & Post Forming', 'Furniture-grade PVA adhesives from premium to general purpose, including water-resistant joinery grades.', 7);

insert into product_industries (product_id, industry_id)
select p.id, i.id from products p join industries i on (i.slug, p.slug) in (
  ('paper-tubes-and-cores','ap-450'), ('paper-tubes-and-cores','k-41'), ('paper-tubes-and-cores','k-30'),
  ('paper-tubes-and-cores','bp-2500'), ('paper-tubes-and-cores','cl-150'), ('paper-tubes-and-cores','dexo-3000'),
  ('paper-tubes-and-cores','dexo-4000'), ('paper-tubes-and-cores','dexo-7000'),
  ('corrugated-boxes','pasting-30'), ('corrugated-boxes','pasting-35'), ('corrugated-boxes','pasting-40'),
  ('corrugated-boxes','corrugation-30'), ('corrugated-boxes','corrugation-35'), ('corrugated-boxes','corrugation-40'),
  ('corrugated-boxes','k-41'),
  ('fibre-drums','cl-150'),
  ('lamination','ap-42'),
  ('furniture-post-forming','ap-44'), ('furniture-post-forming','ap-38'),
  ('furniture-post-forming','ap-32'), ('furniture-post-forming','wr-50')
);

-- Locations ----------------------------------------------------------------
insert into locations_served (slug, name, scope, region, is_primary, sort_order) values
  ('pune', 'Pune', 'india_city', 'West India', true, 1),
  ('mumbai', 'Mumbai', 'india_city', 'West India', true, 2),
  ('delhi', 'Delhi', 'india_city', 'North India', true, 3),
  ('kolkata', 'Kolkata', 'india_city', 'East India', true, 4),
  ('bengaluru', 'Bengaluru', 'india_city', 'South India', true, 5),
  ('hyderabad', 'Hyderabad', 'india_city', 'South India', true, 6),
  ('chennai', 'Chennai', 'india_city', 'South India', true, 7),
  ('ahmedabad', 'Ahmedabad', 'india_city', 'West India', true, 8),
  ('kanpur', 'Kanpur', 'india_city', 'North India', false, 9),
  ('visakhapatnam', 'Visakhapatnam', 'india_city', 'South India', false, 10),
  ('surat', 'Surat', 'india_city', 'West India', false, 11),
  ('kochi', 'Kochi', 'india_city', 'South India', false, 12),
  ('united-arab-emirates', 'United Arab Emirates', 'country', 'Middle East', true, 13),
  ('south-africa', 'South Africa', 'country', 'Africa', true, 14),
  ('middle-east', 'Middle East', 'region', 'Export', false, 15),
  ('africa', 'Africa', 'region', 'Export', false, 16);

-- Plants -------------------------------------------------------------------
insert into plants (name, street_address, area, unit, capacity_mtpa, detail, sort_order) values
  ('Unit 1 — Synthetic Adhesive Division', '', 'Chikhli / PCMC, Pune', 'Unit 1', 3000,
   '5 stainless-steel reactors, DM/RO water plant, full-fledged testing laboratory.', 1),
  ('Unit 2 — Starch Based Gums Division', '', 'Chakan, Pune', 'Unit 2', 3000,
   '2 cookers, blender, ball mill, dedicated quality lab.', 2);

-- Site settings (single source of truth for contact data) -------------------
insert into site_settings (key, value) values
  ('contact', '{"address": "Off. No. 18, 1st Floor, Highway Towers, Mumbai–Pune Road, Chinchwad, Pune 411019, Maharashtra, India", "geo": {"lat": 18.645407, "lng": 73.790265}, "phones": [{"value": "+912066114227", "display": "+91 20 6611 4227", "label": "Office", "verified": true}, {"value": "+919373387149", "display": "+91 93733 87149", "label": "Mobile", "verified": false}, {"value": "+917722077927", "display": "+91 77220 77927", "label": "Mobile", "verified": false}, {"value": "+917722077928", "display": "+91 77220 77928", "label": "Mobile", "verified": false}, {"value": "+919371635319", "display": "+91 93716 35319", "label": "Customer care", "verified": false}], "whatsapp_number": "+919373387149", "email": null, "verified": false}')
on conflict (key) do nothing;
