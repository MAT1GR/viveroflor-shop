/**
 * Catálogo de ejemplo (solo para visualizar el diseño).
 * La forma de los datos replica el esquema de base de datos previsto:
 * categories / products / product_images.
 */
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
    image: "/assets/cat-plantas.jpg",
    emoji: "🌿",
  },
  {
    id: "macetas",
    name: "Macetas",
    slug: "macetas",
    description: "Cerámica, terracota y diseño en tonos naturales.",
    image: "/assets/cat-macetas.jpg",
    emoji: "🪴",
  },
  {
    id: "interior",
    name: "Interior",
    slug: "interior",
    description: "Plantas que se adaptan a living, oficina y baño.",
    image: "/assets/cat-interior.jpg",
    emoji: "🌱",
  },
  {
    id: "exterior",
    name: "Exterior",
    slug: "exterior",
    description: "Para patios, balcones y jardines rosarinos.",
    image: "/assets/cat-exterior.jpg",
    emoji: "☀️",
  },
  {
    id: "accesorios",
    name: "Accesorios",
    slug: "accesorios",
    description: "Sustratos, herramientas y todo para el cuidado.",
    image: "/assets/cat-accesorios.jpg",
    emoji: "✨",
  },
];

import productsData from "../../data/products.json";

export const products: Product[] = productsData as Product[];

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
