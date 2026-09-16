/** Configuración del negocio. Un solo lugar para tocar precios de envío, promos y datos de contacto. */

export const storeConfig = {
  name: "ViveroFlor",
  tagline: "Plantas, macetas y todo para tus espacios verdes.",
  phone: "+54 9 341 555-1588",
  whatsapp: "5493415551588",
  email: "hola@viveroflor.com.ar",
  instagram: "https://instagram.com/viveroflor",
  address: "Lima 1221, Rosario, Santa Fe",
  hours: "Lun a Sáb de 9 a 19 h · Dom de 10 a 14 h",
  timeZone: "America/Argentina/Buenos_Aires",

  shipping: {
    zone: "Rosario",
    pickupLabel: "Retiro por el local",
    pickupCost: 0,
    deliveryLabel: "Envío en Rosario",
    /** Costo fijo del envío dentro de Rosario. */
    deliveryCost: 2500,
    /** Compra mínima (subtotal de productos) para poder pedir envío. */
    minOrderForDelivery: 20000,
  },

  /**
   * Promo mensual: una semana por mes con descuento pagando en efectivo.
   * Para moverla de fecha, cambiar `startDay`. Para apagarla, `enabled: false`.
   */
  promo: {
    enabled: true,
    percent: 10,
    /** Día del mes en que arranca la semana de promo (1 = el 1°). */
    startDay: 1,
    /** Cuántos días dura. */
    durationDays: 7,
    /** Métodos de pago que reciben el descuento. */
    paymentMethods: ["efectivo_local"] as const,
    shortLabel: "10% OFF en efectivo",
    description:
      "Una semana por mes: 10% de descuento abonando en efectivo al retirar por el local.",
  },
} as const;

export const siteUrl = (import.meta.env?.["VITE_SITE_URL"] || "https://viveroflor.com.ar").replace(
  /\/$/,
  "",
);

export const waLink = (message: string) =>
  `https://wa.me/${storeConfig.whatsapp}?text=${encodeURIComponent(message)}`;

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);

/* ------------------------------------------------------------------ */
/* Envío                                                               */
/* ------------------------------------------------------------------ */

export type ShippingMethodId = "pickup" | "delivery";

/** ¿El subtotal alcanza la compra mínima para que podamos enviar? */
export const canDeliver = (subtotal: number) =>
  subtotal >= storeConfig.shipping.minOrderForDelivery;

/** Cuánto falta para llegar a la compra mínima de envío (0 si ya llegó). */
export const missingForDelivery = (subtotal: number) =>
  Math.max(0, storeConfig.shipping.minOrderForDelivery - subtotal);

export const shippingCostFor = (subtotal: number, method: ShippingMethodId) => {
  if (method === "pickup") return 0;
  return canDeliver(subtotal) ? storeConfig.shipping.deliveryCost : 0;
};

/* ------------------------------------------------------------------ */
/* Promo mensual                                                       */
/* ------------------------------------------------------------------ */

export type ActivePromo = {
  percent: number;
  shortLabel: string;
  description: string;
  /** Último día incluido en la promo, en horario de Argentina. */
  endsOn: Date;
  paymentMethods: readonly string[];
};

/** Fecha "de calendario" en Argentina, sin importar dónde corra el server. */
function argentinaParts(now: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: storeConfig.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [year, month, day] = fmt.format(now).split("-").map(Number);
  return { year: year!, month: month!, day: day! };
}

/**
 * Devuelve la promo si hoy cae dentro de la semana de promo del mes actual.
 * La ventana se recorta al último día del mes para meses cortos.
 */
export function getActivePromo(now: Date = new Date()): ActivePromo | null {
  const { promo } = storeConfig;
  if (!promo.enabled || promo.percent <= 0) return null;

  const { year, month, day } = argentinaParts(now);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const start = Math.min(promo.startDay, daysInMonth);
  const end = Math.min(start + promo.durationDays - 1, daysInMonth);
  if (day < start || day > end) return null;

  return {
    percent: promo.percent,
    shortLabel: promo.shortLabel,
    description: promo.description,
    endsOn: new Date(Date.UTC(year, month - 1, end, 23, 59, 59)),
    paymentMethods: promo.paymentMethods,
  };
}

/** Descuento en pesos que corresponde a un subtotal y un medio de pago. */
export function promoDiscountFor(subtotal: number, paymentMethod: string, now: Date = new Date()) {
  const promo = getActivePromo(now);
  if (!promo || !promo.paymentMethods.includes(paymentMethod)) return 0;
  return Math.round((subtotal * promo.percent) / 100);
}

export const formatPromoEnd = (date: Date) =>
  new Intl.DateTimeFormat("es-AR", {
    timeZone: storeConfig.timeZone,
    day: "numeric",
    month: "long",
  }).format(date);
