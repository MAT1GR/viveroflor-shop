/**
 * Catálogo de ejemplo (solo para visualizar el diseño).
 * La forma de los datos replica el esquema de base de datos previsto:
 * categories / products / product_images.
 */
import catPlantas from "@/assets/cat-plantas.jpg";
import catMacetas from "@/assets/cat-macetas.jpg";
import catInterior from "@/assets/cat-interior.jpg";
import catExterior from "@/assets/cat-exterior.jpg";
import catAccesorios from "@/assets/cat-accesorios.jpg";
import pMonstera from "@/assets/p-monstera.jpg";
import pFicus from "@/assets/p-ficus.jpg";
import pPotus from "@/assets/p-potus.jpg";
import pSuculentas from "@/assets/p-suculentas.jpg";
import pMacetaSage from "@/assets/p-maceta-sage.jpg";
import pMacetaTerracota from "@/assets/p-maceta-terracota.jpg";
import pRegadera from "@/assets/p-regadera.jpg";
import pSustrato from "@/assets/p-sustrato.jpg";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  emoji: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price: number | null;
  stock: number;
  category_id: string;
  active: boolean;
  featured: boolean;
  best_seller: boolean;
  is_new: boolean;
  sold: number;
  size: string;
  care?: string;
  features: string[];
  images: string[];
  created_at: string;
  updated_at: string;
};

export const categories: Category[] = [
  {
    id: "plantas",
    name: "Plantas",
    slug: "plantas",
    description: "Verdes de interior y exterior listas para tu casa.",
    image: catPlantas,
    emoji: "🌿",
  },
  {
    id: "macetas",
    name: "Macetas",
    slug: "macetas",
    description: "Cerámica, terracota y diseño en tonos naturales.",
    image: catMacetas,
    emoji: "🪴",
  },
  {
    id: "interior",
    name: "Interior",
    slug: "interior",
    description: "Plantas que se adaptan a living, oficina y baño.",
    image: catInterior,
    emoji: "🌱",
  },
  {
    id: "exterior",
    name: "Exterior",
    slug: "exterior",
    description: "Para patios, balcones y jardines rosarinos.",
    image: catExterior,
    emoji: "☀️",
  },
  {
    id: "accesorios",
    name: "Accesorios",
    slug: "accesorios",
    description: "Sustratos, herramientas y todo para el cuidado.",
    image: catAccesorios,
    emoji: "✨",
  },
];

const iso = (d: string) => new Date(d).toISOString();

export const products: Product[] = [
  {
    id: "prd-001",
    name: "Monstera Deliciosa",
    slug: "monstera-deliciosa",
    description:
      "La clásica que transforma cualquier ambiente. Hojas grandes y perforadas, crecimiento rápido y muy fácil de cuidar. Se entrega en maceta cerámica crema.",
    price: 24900,
    compare_price: 31900,
    stock: 12,
    category_id: "plantas",
    active: true,
    featured: true,
    best_seller: true,
    is_new: false,
    sold: 148,
    size: "Alto aprox. 60 cm · maceta Ø 18 cm",
    care: "Luz indirecta abundante. Riego cada 7 días, dejando secar la capa superior del sustrato.",
    features: ["Incluye maceta cerámica", "Purificadora de aire", "Apta interior", "Bajo mantenimiento"],
    images: [pMonstera, pFicus],
    created_at: iso("2026-06-02"),
    updated_at: iso("2026-08-01"),
  },
  {
    id: "prd-002",
    name: "Ficus Lyrata",
    slug: "ficus-lyrata",
    description:
      "Elegante, vertical y con hojas amplias. Ideal para dar altura a un rincón luminoso del living.",
    price: 32900,
    compare_price: null,
    stock: 6,
    category_id: "plantas",
    active: true,
    featured: true,
    best_seller: false,
    is_new: true,
    sold: 42,
    size: "Alto aprox. 80 cm · maceta Ø 20 cm",
    care: "Mucha luz indirecta. Riego semanal. Evitar corrientes de aire frío.",
    features: ["Incluye maceta", "Ideal living", "Crecimiento vertical"],
    images: [pFicus, pMonstera],
    created_at: iso("2026-07-20"),
    updated_at: iso("2026-08-10"),
  },
  {
    id: "prd-003",
    name: "Potus colgante",
    slug: "potus-colgante",
    description:
      "Resistente, generoso y perfecto para estantes altos. Sus guías crecen rápido y se adaptan a poca luz.",
    price: 15900,
    compare_price: 18900,
    stock: 25,
    category_id: "interior",
    active: true,
    featured: true,
    best_seller: true,
    is_new: false,
    sold: 210,
    size: "Maceta colgante Ø 15 cm",
    care: "Tolera media sombra. Riego cada 7 a 10 días.",
    features: ["Incluye colgante de yute", "Muy resistente", "Ideal principiantes"],
    images: [pPotus],
    created_at: iso("2026-05-11"),
    updated_at: iso("2026-08-05"),
  },
  {
    id: "prd-004",
    name: "Trío de suculentas",
    slug: "trio-de-suculentas",
    description:
      "Tres suculentas seleccionadas en macetitas de terracota. Un regalo simple y siempre acertado.",
    price: 11900,
    compare_price: null,
    stock: 30,
    category_id: "interior",
    active: true,
    featured: true,
    best_seller: false,
    is_new: true,
    sold: 88,
    size: "3 macetas Ø 7 cm",
    care: "Sol directo o mucha luz. Riego cada 15 días.",
    features: ["Incluye 3 macetas", "Listo para regalar", "Riego mínimo"],
    images: [pSuculentas],
    created_at: iso("2026-07-30"),
    updated_at: iso("2026-08-12"),
  },
  {
    id: "prd-005",
    name: "Maceta cerámica verde salvia",
    slug: "maceta-ceramica-verde-salvia",
    description:
      "Maceta de cerámica esmaltada mate en verde salvia, con orificio de drenaje y base protectora.",
    price: 13500,
    compare_price: 16900,
    stock: 18,
    category_id: "macetas",
    active: true,
    featured: true,
    best_seller: true,
    is_new: false,
    sold: 132,
    size: "Ø 16 cm · alto 14 cm",
    features: ["Cerámica esmaltada", "Con drenaje", "Interior y exterior cubierto"],
    images: [pMacetaSage],
    created_at: iso("2026-04-18"),
    updated_at: iso("2026-08-02"),
  },
  {
    id: "prd-006",
    name: "Set 3 macetas de terracota",
    slug: "set-3-macetas-terracota",
    description:
      "Set de tres macetas de terracota natural en tamaños escalonados. El material clásico que respira y cuida las raíces.",
    price: 9900,
    compare_price: null,
    stock: 0,
    category_id: "macetas",
    active: true,
    featured: false,
    best_seller: false,
    is_new: false,
    sold: 64,
    size: "Ø 10 / 13 / 16 cm",
    features: ["Terracota natural", "Set de 3", "Con drenaje"],
    images: [pMacetaTerracota],
    created_at: iso("2026-03-09"),
    updated_at: iso("2026-07-28"),
  },
  {
    id: "prd-007",
    name: "Regadera metálica dorada",
    slug: "regadera-metalica-dorada",
    description:
      "Regadera de metal con pico largo para llegar a la base de la planta sin mojar las hojas. Linda a la vista, práctica en el uso.",
    price: 18900,
    compare_price: 22900,
    stock: 9,
    category_id: "accesorios",
    active: true,
    featured: true,
    best_seller: false,
    is_new: false,
    sold: 51,
    size: "Capacidad 1,2 L",
    features: ["Pico largo de precisión", "Metal con acabado mate", "Uso interior"],
    images: [pRegadera],
    created_at: iso("2026-06-25"),
    updated_at: iso("2026-08-08"),
  },
  {
    id: "prd-008",
    name: "Sustrato premium 5 L + pala",
    slug: "sustrato-premium-5l",
    description:
      "Mezcla lista para trasplantar: turba, perlita y compost. Incluye pala de mano de acero con cabo de madera.",
    price: 7900,
    compare_price: null,
    stock: 40,
    category_id: "accesorios",
    active: true,
    featured: false,
    best_seller: true,
    is_new: false,
    sold: 176,
    size: "Bolsa 5 L",
    features: ["Con perlita y compost", "Incluye pala", "Para interior y exterior"],
    images: [pSustrato],
    created_at: iso("2026-02-14"),
    updated_at: iso("2026-07-19"),
  },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getProduct = (slug: string) => products.find((p) => p.slug === slug && p.active);
export const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Productos";

export const discountPercent = (p: Product) =>
  p.compare_price && p.compare_price > p.price
    ? Math.round((1 - p.price / p.compare_price) * 100)
    : 0;

export const relatedProducts = (p: Product, limit = 4) =>
  products
    .filter((x) => x.active && x.id !== p.id)
    .sort((a, b) => Number(b.category_id === p.category_id) - Number(a.category_id === p.category_id))
    .slice(0, limit);
