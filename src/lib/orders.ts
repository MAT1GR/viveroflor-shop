import type { CartItem } from "./cart";

export type OrderStatus =
  | "pendiente"
  | "pagado"
  | "preparando"
  | "listo"
  | "enviado"
  | "entregado"
  | "cancelado";

export type ShippingMethod = "pickup" | "delivery";

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  payment_status: "pendiente" | "aprobado" | "rechazado";
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  shipping_method: ShippingMethod;
  shipping_address: {
    street?: string;
    number?: string;
    apartment?: string;
    neighborhood?: string;
    city?: string;
  } | null;
  items: CartItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  created_at: string;
};

const STORAGE_KEY = "viveroflor.orders.v1";

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: Order) {
  const orders = loadOrders();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...orders]));
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  const orders = loadOrders().map((o) => (o.id === id ? { ...o, status } : o));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return orders;
}

export function newOrderNumber() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `VF-${new Date().getFullYear()}-${n}`;
}

export const statusLabels: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  preparando: "Preparando",
  listo: "Listo",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};
