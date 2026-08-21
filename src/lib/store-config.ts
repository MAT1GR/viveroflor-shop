/** Configuración del negocio. En producción se lee de la tabla store_settings. */
export const storeConfig = {
  name: "ViveroFlor",
  tagline: "Plantas, macetas y todo para tus espacios verdes.",
  phone: "+54 341 555 0198",
  whatsapp: "5493415550198",
  email: "hola@viveroflor.com.ar",
  instagram: "https://instagram.com/viveroflor",
  address: "Av. Pellegrini 1450, Rosario, Santa Fe",
  hours: "Lun a Sáb de 9 a 19 h · Dom de 10 a 14 h",
  shipping: {
    pickupLabel: "Retiro por el local",
    pickupCost: 0,
    deliveryLabel: "Envío en Rosario",
    deliveryCost: 3500,
    freeFrom: 45000,
  },
};

export const waLink = (message: string) =>
  `https://wa.me/${storeConfig.whatsapp}?text=${encodeURIComponent(message)}`;

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);

export const shippingCostFor = (subtotal: number, method: "pickup" | "delivery") => {
  if (method === "pickup") return 0;
  return subtotal >= storeConfig.shipping.freeFrom ? 0 : storeConfig.shipping.deliveryCost;
};
