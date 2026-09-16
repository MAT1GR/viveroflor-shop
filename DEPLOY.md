# Puesta en producción — ViveroFlor

El proyecto compila a un **Cloudflare Worker** (`npm run build` → `.output/`).
Todo lo que sigue hay que hacerlo una sola vez.

---

## 1. Base de datos (Turso) — obligatorio

Cloudflare Workers no tiene disco: el archivo `local.db` sirve sólo para
desarrollo. En producción hace falta una base libSQL remota.

1. Crear una cuenta gratis en <https://turso.tech> y una base nueva.
2. Copiar la URL (`libsql://...`) y generar un auth token.
3. Cargarlas como `TURSO_URL` y `TURSO_AUTH_TOKEN`.
4. Crear las tablas apuntando a esa base:

```bash
TURSO_URL=libsql://... TURSO_AUTH_TOKEN=... npm run db:init
```

`db:init` es idempotente: se puede volver a correr después de cada deploy y
sólo agrega lo que falte.

---

## 2. WhatsApp — obligatorio para recibir los pedidos

No hay cobro online. Al confirmar la compra, el sitio registra el pedido
(descontando el stock) y abre WhatsApp con el detalle completo —número de
pedido, productos, entrega, dirección y total— para que el cliente lo mande al
vivero y ahí se coordine el pago.

El número que recibe los mensajes sale de `whatsapp` en
[`src/lib/store-config.ts`](src/lib/store-config.ts). Va **sin `+`, sin
espacios y sin guiones**, con código de país y el `9` de celular argentino:

```ts
whatsapp: "5493415551588",
```

No hace falta ninguna variable de entorno para esto. Conviene verificarlo
abriendo `https://wa.me/<numero>` antes de salir a producción.

---

## 3. Panel de administración — obligatorio

Sin estas variables el login de `/admin` rechaza cualquier intento (a propósito:
antes las credenciales estaban escritas en el código).

```
ADMIN_USER=<usuario>
ADMIN_PASSWORD=<contraseña larga>
ADMIN_SESSION_SECRET=<cadena aleatoria larga>
```

Generar el secret:

```bash
node -e "console.log(crypto.randomUUID()+crypto.randomUUID())"
```

---

## 4. Dominio

```
VITE_SITE_URL=https://viveroflor.com.ar
```

Se usa para las imágenes de Open Graph (la miniatura al compartir el link).
Es una variable de **build**: hay que rebuildear si cambia.

---

## 5. Deploy

```bash
npm run build
npx wrangler deploy
```

Las variables van como secrets del Worker:

```bash
npx wrangler secret put TURSO_URL
npx wrangler secret put TURSO_AUTH_TOKEN
npx wrangler secret put ADMIN_USER
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SESSION_SECRET
```

---

## Checklist antes de abrir la tienda

- [ ] `TURSO_URL` + `TURSO_AUTH_TOKEN` cargados y `npm run db:init` corrido.
- [ ] Número de WhatsApp real en `src/lib/store-config.ts` (probado con `wa.me`).
- [ ] `ADMIN_USER` / `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` cargados.
- [ ] Catálogo cargado desde `/admin/productos` con fotos y stock reales.
- [ ] Email e Instagram reales en `src/lib/store-config.ts`.
- [ ] Horarios del local confirmados en `src/lib/store-config.ts`.
- [ ] Una compra de prueba de punta a punta: el mensaje de WhatsApp llega completo.

---

## Dónde se tocan las reglas del negocio

Todo vive en [`src/lib/store-config.ts`](src/lib/store-config.ts):

| Qué                                 | Dónde                          | Valor actual |
| ----------------------------------- | ------------------------------ | ------------ |
| Costo de envío en Rosario           | `shipping.deliveryCost`        | `$2.500`     |
| Compra mínima para enviar           | `shipping.minOrderForDelivery` | `$20.000`    |
| Descuento de la promo               | `promo.percent`                | `10%`        |
| Día del mes en que arranca la promo | `promo.startDay`               | `1`          |
| Cuántos días dura                   | `promo.durationDays`           | `7`          |
| Apagar la promo                     | `promo.enabled`                | `true`       |

La promo se repite **sola todos los meses**: del día `startDay` al `startDay +
durationDays - 1`, en horario de Argentina. No hay que prenderla y apagarla a
mano. Se aplica únicamente al pagar **en efectivo al retirar por el local**, y
se muestra en la barra superior del sitio y en el checkout.

---

## Cómo funciona el stock

El stock se mueve solo; no hay que tocarlo a mano salvo cuando entra mercadería.

| Momento                             | Qué pasa                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| Se confirma un pedido               | Baja el stock y sube el contador de vendidos, en la misma transacción que guarda el pedido |
| No alcanza el stock                 | El pedido se rechaza entero con el mensaje "Quedan N", y no se cobra nada                  |
| Se cancela un pedido desde el panel | El stock vuelve a la tienda                                                                |
| Se saca un pedido de "cancelado"    | Se vuelve a descontar; si mientras tanto se agotó, el panel avisa y no cambia el estado    |

Dos personas no pueden comprar la última unidad: el descuento va con un
`WHERE stock >= cantidad`, así que el segundo pedido no afecta ninguna fila y
se hace rollback.

En el listado de productos del panel, el stock aparece en rojo cuando llega a 0
y en amarillo cuando quedan 3 o menos.

### Lo que sigue siendo manual

- **Reponer stock**: se carga desde `/admin/productos` al editar el producto.
- **Pedidos abandonados**: el stock se reserva al confirmar el pedido, aunque
  el cliente después no mande el mensaje de WhatsApp. Esos pedidos quedan en
  "pendiente"; hay que cancelarlos desde el panel para devolver el stock.
- **Marcar el pedido como pagado**: cuando entra la transferencia o se cobra en
  el local, el estado se cambia a mano desde `/admin/pedidos`.
