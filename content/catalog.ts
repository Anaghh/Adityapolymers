/**
 * Canonical catalog content, seeded from the 2026-09-26 audit of
 * adityapolymers.com (raw pages preserved in .ap_audit/).
 *
 * This file is the dev-time fallback for the data layer (lib/data.ts) and
 * the source of truth for the Supabase seed migration (supabase/migrations).
 * Facts here must never be invented: spec values are populated only from
 * client TDS documents, so they stay `null` until supplied.
 */

export type CategorySeed = {
  slug: string;
  parentSlug: string | null;
  name: string;
  shortName: string;
  description: string;
  sortOrder: number;
};

export type ProductSeed = {
  slug: string;
  categorySlug: string;
  name: string;
  brand: string;
  applications: string;
  /** Values only from client TDS documents — never invented. */
  specs: {
    solids_pct: number | null;
    viscosity: string | null;
    ph: string | null;
    base: string | null;
    water_resistant: boolean | null;
  };
  packSizes: string[];
  isRetailPack: boolean;
  notes: string | null;
};

export type IndustrySeed = {
  slug: string;
  name: string;
  summary: string;
  productSlugs: string[];
};

export const CATEGORIES: CategorySeed[] = [
  {
    slug: "synthetic",
    parentSlug: null,
    name: "Synthetic Adhesives",
    shortName: "Synthetic",
    description:
      "PVA/VAM-based synthetic adhesives for textile tubes, paper conversion and food-grade packaging, manufactured under the Dr Bond brand.",
    sortOrder: 1,
  },
  {
    slug: "packaging",
    parentSlug: null,
    name: "Packaging Adhesives",
    shortName: "Packaging",
    description:
      "Paper conversion, lamination, labeling and starch-based (dextrin) adhesives for corrugated boxes, paper tubes and cores, composite cans and fibre drums.",
    sortOrder: 2,
  },
  {
    slug: "paper-conversion",
    parentSlug: "packaging",
    name: "Paper Conversion Adhesives",
    shortName: "Paper Conversion",
    description:
      "Synthetic homopolymer adhesives for paper-to-paper pasting across paper and textile tubes, agarbatti tubes, mailing tubes, composite cans and fibre drums. Customised grades developed against customer requirement.",
    sortOrder: 3,
  },
  {
    slug: "lamination",
    parentSlug: "packaging",
    name: "Lamination Adhesives",
    shortName: "Lamination",
    description:
      "Temperature-resistant, solvent-free lamination adhesives that stick quickly even to rough surfaces — including high-speed E-fluting lamination machines.",
    sortOrder: 4,
  },
  {
    slug: "labeling",
    parentSlug: "packaging",
    name: "Labeling Adhesives",
    shortName: "Labeling",
    description:
      "Labeling adhesives for the packaging industry that stick to paper, metal and other surfaces, available in various sizes, shapes and colours.",
    sortOrder: 5,
  },
  {
    slug: "starch-based-dextrin",
    parentSlug: "packaging",
    name: "Starch Based Adhesives (Dextrin)",
    shortName: "Starch / Dextrin",
    description:
      "Cold-mix and hot-mix dextrin grades for paper tubes, cores, edge guards and fibre drums, plus pasting and corrugation grades for carton making.",
    sortOrder: 6,
  },
  {
    slug: "wood-working",
    parentSlug: null,
    name: "Wood Working & Furniture Adhesives",
    shortName: "Wood Working",
    description:
      "Furniture-grade PVA adhesives from premium to general purpose, including a water-resistant grade for demanding joinery.",
    sortOrder: 7,
  },
];

export const PRODUCTS: ProductSeed[] = [
  // ——— Synthetic (5) ———
  {
    slug: "ap-450",
    categorySlug: "synthetic",
    name: "Dr Bond AP-450",
    brand: "Dr Bond",
    applications: "Textile tubes",
    specs: { solids_pct: null, viscosity: null, ph: null, base: "PVA/VAM", water_resistant: null },
    packSizes: [],
    isRetailPack: false,
    notes: null,
  },
  {
    slug: "k-41",
    categorySlug: "synthetic",
    name: "Dr Bond K-41",
    brand: "Dr Bond",
    applications: "Textile tube top paper (GP/VP) and carton side pasting",
    specs: { solids_pct: null, viscosity: null, ph: null, base: "PVA/VAM", water_resistant: null },
    packSizes: [],
    isRetailPack: false,
    notes: null,
  },
  {
    slug: "k-30",
    categorySlug: "synthetic",
    name: "Dr Bond K-30",
    brand: "Dr Bond",
    applications: "Low-cost adhesive for textile and small paper tubes",
    specs: { solids_pct: null, viscosity: null, ph: null, base: "PVA/VAM", water_resistant: null },
    packSizes: [],
    isRetailPack: false,
    notes: null,
  },
  {
    slug: "bp-2500",
    categorySlug: "synthetic",
    name: "Dr Bond BP 2500",
    brand: "Dr Bond",
    applications: "VP/GP paper tubes — high solid, low viscosity",
    specs: { solids_pct: null, viscosity: null, ph: null, base: "PVA/VAM", water_resistant: null },
    packSizes: [],
    isRetailPack: false,
    notes: null,
  },
  {
    slug: "ap-42",
    categorySlug: "synthetic",
    name: "Dr Bond AP-42",
    brand: "Dr Bond",
    applications: "E-fluting laminators; food-grade packaging",
    specs: { solids_pct: null, viscosity: null, ph: null, base: "PVA/VAM", water_resistant: null },
    packSizes: [],
    isRetailPack: false,
    notes: null,
  },

  // ——— Starch based / dextrin (10) ———
  {
    slug: "cl-150",
    categorySlug: "starch-based-dextrin",
    name: "Dr Bond CL 150",
    brand: "Dr Bond",
    applications: "Paper tubes, paper cores, edge guards, fibre drums — cold mixing, no cooking or heating required",
    specs: { solids_pct: null, viscosity: null, ph: null, base: "Starch / dextrin", water_resistant: null },
    packSizes: [],
    isRetailPack: false,
    notes: "Quality tested on solid content, viscosity, pH and film properties.",
  },
  {
    slug: "dexo-3000",
    categorySlug: "starch-based-dextrin",
    name: "Dr Bond DEXO 3000",
    brand: "Dr Bond",
    applications: "Paper tubes and paper cores — hot mixing grade (cooking equipment required)",
    specs: { solids_pct: null, viscosity: null, ph: null, base: "Starch / dextrin", water_resistant: null },
    packSizes: [],
    isRetailPack: false,
    notes: null,
  },
  {
    slug: "dexo-4000",
    categorySlug: "starch-based-dextrin",
    name: "Dr Bond DEXO 4000",
    brand: "Dr Bond",
    applications: "Paper tubes and paper cores — hot mixing grade (cooking equipment required)",
    specs: { solids_pct: null, viscosity: null, ph: null, base: "Starch / dextrin", water_resistant: null },
    packSizes: [],
    isRetailPack: false,
    notes: null,
  },
  {
    slug: "dexo-7000",
    categorySlug: "starch-based-dextrin",
    name: "Dr Bond DEXO 7000",
    brand: "Dr Bond",
    applications: "Textile tubes — hot mixing grade (cooking equipment required)",
    specs: { solids_pct: null, viscosity: null, ph: null, base: "Starch / dextrin", water_resistant: null },
    packSizes: [],
    isRetailPack: false,
    notes: null,
  },
  {
    slug: "pasting-30",
    categorySlug: "starch-based-dextrin",
    name: "Dr Bond PASTING 30",
    brand: "Dr Bond",
    applications: "Corrugation in corrugated carton and box making",
    specs: { solids_pct: null, viscosity: null, ph: null, base: "Starch / dextrin", water_resistant: null },
    packSizes: [],
    isRetailPack: false,
    notes: null,
  },
  {
    slug: "pasting-35",
    categorySlug: "starch-based-dextrin",
    name: "Dr Bond PASTING 35",
    brand: "Dr Bond",
    applications: "Corrugation in corrugated carton and box making",
    specs: { solids_pct: null, viscosity: null, ph: null, base: "Starch / dextrin", water_resistant: null },
    packSizes: [],
    isRetailPack: false,
    notes: null,
  },
  {
    slug: "pasting-40",
    categorySlug: "starch-based-dextrin",
    name: "Dr Bond PASTING 40",
    brand: "Dr Bond",
    applications: "Corrugation in corrugated carton and box making",
    specs: { solids_pct: null, viscosity: null, ph: null, base: "Starch / dextrin", water_resistant: null },
    packSizes: [],
    isRetailPack: false,
    notes: null,
  },
  {
    slug: "corrugation-30",
    categorySlug: "starch-based-dextrin",
    name: "Dr Bond CORRUGATION 30",
    brand: "Dr Bond",
    applications: "Pasting in box making",
    specs: { solids_pct: null, viscosity: null, ph: null, base: "Starch / dextrin", water_resistant: null },
    packSizes: [],
    isRetailPack: false,
    notes: null,
  },
  {
    slug: "corrugation-35",
    categorySlug: "starch-based-dextrin",
    name: "Dr Bond CORRUGATION 35",
    brand: "Dr Bond",
    applications: "Pasting in box making",
    specs: { solids_pct: null, viscosity: null, ph: null, base: "Starch / dextrin", water_resistant: null },
    packSizes: [],
    isRetailPack: false,
    notes: null,
  },
  {
    slug: "corrugation-40",
    categorySlug: "starch-based-dextrin",
    name: "Dr Bond CORRUGATION 40",
    brand: "Dr Bond",
    applications: "Pasting in box making",
    specs: { solids_pct: null, viscosity: null, ph: null, base: "Starch / dextrin", water_resistant: null },
    packSizes: [],
    isRetailPack: false,
    notes: null,
  },

  // ——— Wood working (4) ———
  {
    slug: "ap-44",
    categorySlug: "wood-working",
    name: "Dr Bond AP 44",
    brand: "Dr Bond",
    applications: "Premium grade for interior decoration, wood working and joinery",
    specs: { solids_pct: 44, viscosity: null, ph: null, base: "PVA", water_resistant: null },
    packSizes: [],
    isRetailPack: true,
    notes: null,
  },
  {
    slug: "ap-38",
    categorySlug: "wood-working",
    name: "Dr Bond AP 38",
    brand: "Dr Bond",
    applications: "High grade for carpenters and interior decorators",
    specs: { solids_pct: 38, viscosity: null, ph: null, base: "PVA", water_resistant: null },
    packSizes: [],
    isRetailPack: true,
    notes: null,
  },
  {
    slug: "ap-32",
    categorySlug: "wood-working",
    name: "Dr Bond AP 32",
    brand: "Dr Bond",
    applications: "Medium grade for general purpose furniture and wood working; domestic uses",
    specs: { solids_pct: 32, viscosity: null, ph: null, base: "PVA", water_resistant: null },
    packSizes: [],
    isRetailPack: true,
    notes: null,
  },
  {
    slug: "wr-50",
    categorySlug: "wood-working",
    name: "Dr Bond WR 50",
    brand: "Dr Bond",
    applications: "Water-resistant applications in the furniture industry",
    specs: { solids_pct: 50, viscosity: null, ph: null, base: "PVA", water_resistant: true },
    packSizes: [],
    isRetailPack: true,
    notes: null,
  },
];

export const INDUSTRIES: IndustrySeed[] = [
  {
    slug: "paper-tubes-and-cores",
    name: "Paper Tubes & Cores",
    summary:
      "Adhesives for paper tubes and cores across high-speed yarn winding (POY, FDY, DTY), agarbatti tubes, mailing tubes and cores for polyester and BOPP films.",
    productSlugs: ["ap-450", "k-41", "k-30", "bp-2500", "cl-150", "dexo-3000", "dexo-4000", "dexo-7000"],
  },
  {
    slug: "corrugated-boxes",
    name: "Corrugated Boxes & Boards",
    summary:
      "Pasting and corrugation grades plus synthetic side-pasting adhesives for corrugated carton and box making.",
    productSlugs: ["pasting-30", "pasting-35", "pasting-40", "corrugation-30", "corrugation-35", "corrugation-40", "k-41"],
  },
  {
    slug: "composite-cans",
    name: "Composite & Combi Cans",
    summary: "Adhesives for composite and combi can manufacture.",
    productSlugs: [],
  },
  {
    slug: "fibre-drums",
    name: "Fibre Drums (Pharma & Chemical)",
    summary:
      "Square fibre drum adhesives for the pharma and chemical industries — a capability claimed as a first in India.",
    productSlugs: ["cl-150"],
  },
  {
    slug: "lamination",
    name: "Lamination",
    summary: "Temperature-resistant, solvent-free lamination including high-speed E-fluting machines.",
    productSlugs: ["ap-42"],
  },
  {
    slug: "labeling",
    name: "Labeling",
    summary: "Labeling adhesives for paper, metal and other surfaces across the packaging industry.",
    productSlugs: [],
  },
  {
    slug: "furniture-post-forming",
    name: "Furniture & Post Forming",
    summary: "Furniture-grade PVA adhesives from premium to general purpose, including water-resistant joinery grades.",
    productSlugs: ["ap-44", "ap-38", "ap-32", "wr-50"],
  },
];

/** Featured Indian metros for /locations — exports handled separately. */
export const LOCATIONS: { name: string; scope: "india_city" | "country" | "region"; region: string; isPrimary: boolean }[] = [
  { name: "Pune", scope: "india_city", region: "West India", isPrimary: true },
  { name: "Mumbai", scope: "india_city", region: "West India", isPrimary: true },
  { name: "Delhi", scope: "india_city", region: "North India", isPrimary: true },
  { name: "Kolkata", scope: "india_city", region: "East India", isPrimary: true },
  { name: "Bengaluru", scope: "india_city", region: "South India", isPrimary: true },
  { name: "Hyderabad", scope: "india_city", region: "South India", isPrimary: true },
  { name: "Chennai", scope: "india_city", region: "South India", isPrimary: true },
  { name: "Ahmedabad", scope: "india_city", region: "West India", isPrimary: true },
  { name: "Kanpur", scope: "india_city", region: "North India", isPrimary: false },
  { name: "Visakhapatnam", scope: "india_city", region: "South India", isPrimary: false },
  { name: "Surat", scope: "india_city", region: "West India", isPrimary: false },
  { name: "Kochi", scope: "india_city", region: "South India", isPrimary: false },
  { name: "United Arab Emirates", scope: "country", region: "Middle East", isPrimary: true },
  { name: "South Africa", scope: "country", region: "Africa", isPrimary: true },
  { name: "Middle East", scope: "region", region: "Export", isPrimary: false },
  { name: "Africa", scope: "region", region: "Export", isPrimary: false },
];

/**
 * Audited contact data. Numbers marked verified: false conflict between
 * pages (see audit) and MUST be reconciled with the client before launch —
 * the admin dashboard site-settings screen is the single source of truth.
 */
export const SITE = {
  name: "Aditya Polymers",
  brand: "Dr Bond",
  tagline: "Industrial adhesives, engineered in Pune.",
  address:
    "Off. No. 18, 1st Floor, Highway Towers, Mumbai–Pune Road, Chinchwad, Pune 411019, Maharashtra, India",
  geo: { lat: 18.645407, lng: 73.790265 },
  phones: [
    { value: "+912066114227", display: "+91 20 6611 4227", label: "Office", verified: true },
    { value: "+919373387149", display: "+91 93733 87149", label: "Mobile", verified: false },
    { value: "+917722077927", display: "+91 77220 77927", label: "Mobile", verified: false },
    { value: "+917722077928", display: "+91 77220 77928", label: "Mobile", verified: false },
    { value: "+919371635319", display: "+91 93716 35319", label: "Customer care", verified: false },
  ],
  whatsappNumber: "+919373387149", // pending client confirmation
  email: null as string | null, // pending client confirmation — publish one monitored inbox
  plants: [
    {
      name: "Unit 1 — Synthetic Adhesive Division",
      area: "Chikhli / PCMC, Pune",
      capacity: "3000 MTPA",
      detail: "5 stainless-steel reactors, DM/RO water plant, full-fledged testing laboratory.",
    },
    {
      name: "Unit 2 — Starch Based Gums Division",
      area: "Chakan, Pune",
      capacity: "3000 MTPA",
      detail: "2 cookers, blender, ball mill, dedicated quality lab.",
    },
  ],
  keyFigures: [
    { value: "6000", unit: "MTPA", label: "combined capacity across 2 units" },
    { value: "25", unit: "years", label: "of adhesive manufacturing leadership" },
    { value: "2", unit: "plants", label: "Chikhli/PCMC & Chakan, Pune" },
    { value: "UAE + SA", unit: "export", label: "Middle East & Africa, shipping worldwide" },
  ],
  stats: {
    reactors: 5,
    pilotPlant: "50 kg",
    rndReactor: "2 kg glass",
    labTests: ["Tackiness", "Solid content", "Viscosity", "pH", "Film coverage", "Fibre tear", "Water resistance", "UTM bond strength"],
  },
} as const;

export default { CATEGORIES, PRODUCTS, INDUSTRIES, LOCATIONS, SITE };
