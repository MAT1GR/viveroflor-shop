# ViveroFlor E-commerce

Crear una tienda online completa y moderna para un vivero llamado **ViveroFlor**, orientada principalmente a clientes de Rosario, Santa Fe, Argentina.

## OBJETIVO

La web debe funcionar como un ecommerce real, no como una landing page.

El objetivo principal es que una persona pueda:

1. Entrar desde Instagram.

2. Explorar plantas, macetas y productos.

3. Filtrar y buscar productos fácilmente.

4. Ver el detalle de un producto.

5. Agregar productos al carrito.

6. Revisar su pedido.

7. Completar sus datos.

8. Elegir retiro por el local o envío.

9. Confirmar el pedido por WhatsApp, donde se coordina el pago.

10. Recibir una confirmación del pedido.

La experiencia debe ser extremadamente simple, rápida e intuitiva, especialmente desde celular.

---

# IDENTIDAD VISUAL

Marca: **ViveroFlor**

Rubro: vivero, plantas, macetas, decoración y productos para el hogar.

Estética:

- Natural

- Moderna

- Cálida

- Premium pero accesible

- Minimalista

- Fresca

- Visualmente atractiva

- Nada de estética excesivamente rústica o "gauchesca"

Utilizar una paleta inspirada en naturaleza:

- Verde oscuro para elementos principales.

- Verde salvia.

- Blanco cálido / crema para fondos.

- Beige claro.

- Gris oscuro para textos.

- Verde claro como color secundario.

Evitar colores demasiado saturados.

Tipografía moderna, limpia y altamente legible.

Usar bordes ligeramente redondeados, sombras muy sutiles y suficiente espacio en blanco.

Las imágenes de productos deben tener mucho protagonismo.

---

# ESTRUCTURA GENERAL

Crear las siguientes páginas:

- Inicio

- Tienda

- Categorías

- Producto

- Carrito

- Checkout

- Página de compra exitosa

- Página de compra cancelada

- Página de contacto

- Preguntas frecuentes

- Sobre nosotros

---

# HEADER

Desktop:

Logo ViveroFlor a la izquierda.

Centro:

- Inicio

- Tienda

- Plantas

- Macetas

- Accesorios

- Nosotros

Derecha:

- Buscador

- Cuenta

- Carrito

Mobile:

Header compacto:

Logo

Icono búsqueda

Icono carrito

Menú hamburguesa

El header debe permanecer sticky mientras el usuario navega.

Mostrar badge con cantidad de productos en el carrito.

---

# HOME

Crear una homepage comercial, no simplemente institucional.

## HERO

Imagen grande y atractiva de plantas/interior de un vivero.

Título:

**"Llevá naturaleza a tu hogar."**

Subtítulo:

**"Plantas, macetas y todo lo que necesitás para crear tus espacios verdes."**

Botón principal:

**Ver tienda**

Botón secundario:

**Conocé nuestros productos**

El hero debe funcionar perfectamente en mobile.

---

# CATEGORÍAS DESTACADAS

Mostrar tarjetas visuales grandes para:

🌿 Plantas

🪴 Macetas

🌱 Interior

☀️ Exterior

✨ Accesorios

Cada categoría debe tener imagen, nombre y CTA.

---

# PRODUCTOS DESTACADOS

Título:

**"Elegidos para vos"**

Mostrar una grilla de productos.

Cada tarjeta debe incluir:

- Imagen

- Categoría

- Nombre

- Precio

- Precio anterior si existe

- Descuento si corresponde

- Estado de stock

- Botón "Agregar al carrito"

Al pasar el mouse:

- Pequeña animación.

- Imagen ligeramente ampliada.

- Botón de compra visible.

En mobile mantener la experiencia simple y rápida.

---

# SECCIÓN BENEFICIOS

Mostrar 4 beneficios con iconos:

🚚 Envíos en Rosario

🏪 Retiro en nuestro local

💳 Pagá online de forma segura

🌿 Productos seleccionados

Diseño horizontal en desktop y grid en mobile.

---

# SECCIÓN "COMPRÁ ONLINE"

Crear una sección explicando brevemente el proceso:

### 1. Elegí tus productos

Explorá nuestro catálogo.

### 2. Armá tu pedido

Agregá todo lo que necesitás al carrito.

### 3. Elegí cómo recibirlo

Retiro por el local o envío.

### 4. Recibí tu pedido

Te avisamos cuando esté listo.

Utilizar iconos y pequeñas animaciones.

---

# TIENDA

La página de tienda debe ser el núcleo del ecommerce.

Header de tienda:

**Todos los productos**

Agregar:

- Buscador

- Ordenar por

- Filtros

- Categorías

- Rango de precios

- Disponibilidad

Ordenamiento:

- Relevancia

- Más vendidos

- Precio menor a mayor

- Precio mayor a menor

- Más nuevos

Filtros en desktop mediante sidebar.

En mobile utilizar un botón:

**Filtrar y ordenar**

que abra un drawer inferior.

---

# PRODUCT CARD

Diseñar tarjetas modernas.

Estructura:

Imagen grande.

Badge opcional:

- NUEVO

- OFERTA

- MÁS VENDIDO

Nombre.

Categoría.

Precio.

Stock.

CTA:

**Agregar al carrito**

Si no hay stock:

**Sin stock**

No permitir agregar productos sin stock.

---

# PRODUCT DETAIL

Al hacer click en un producto mostrar:

Galería de imágenes a la izquierda.

Información a la derecha:

- Nombre

- Categoría

- Precio

- Precio anterior

- Descuento

- Disponibilidad

- Descripción

- Características

- Tamaño

- Cuidados cuando corresponda

- Cantidad

- Botón grande "Agregar al carrito"

Agregar:

**Comprar ahora**

debajo del botón principal.

Mostrar información de entrega:

🚚 Envíos dentro de Rosario

🏪 Retiro por el local

💳 Pago seguro

Agregar sección:

**También te puede gustar**

con productos relacionados.

---

# CARRITO

Crear un carrito lateral tipo drawer y una página completa de carrito.

Cada producto:

- Imagen

- Nombre

- Precio

- Cantidad

- Controles +/-

- Subtotal

- Eliminar

Mostrar:

Subtotal

Costo de envío

Total

CTA:

**Continuar compra**

Agregar:

**Seguir comprando**

El carrito debe actualizarse inmediatamente.

Persistir carrito utilizando localStorage.

---

# CHECKOUT

Crear un checkout limpio y muy simple.

No utilizar header completo para evitar distracciones.

Dividir visualmente en:

## Datos del cliente

- Nombre

- Apellido

- Email

- Teléfono

## Entrega

Opciones:

### Retiro por el local

Gratis

### Envío

Ingresar:

- Dirección

- Número

- Piso/departamento opcional

- Barrio

- Ciudad

Mostrar costo de envío cuando corresponda.

## Pago

No hay cobro online: el pedido se cierra por **WhatsApp**.

El flujo debe quedar preparado para:

Checkout → se registra el pedido (descuenta stock) → se abre WhatsApp con el detalle completo → página del pedido.

---

# PÁGINA DE COMPRA EXITOSA

Diseño limpio y positivo.

Icono de confirmación.

Título:

**¡Compra realizada!**

Texto:

**Recibimos tu pedido correctamente.**

Mostrar:

- Número de pedido

- Resumen

- Total

- Método de entrega

- Estado

Botón:

**Volver a la tienda**

Y otro:

**Ver mi pedido**

---

# PÁGINA DE COMPRA CANCELADA

Mostrar:

**El pago no se pudo completar**

Explicar brevemente que el pedido no fue confirmado.

Botones:

**Intentar nuevamente**

**Volver al carrito**

---

# PANEL ADMINISTRATIVO

Crear también una estructura de dashboard administrativo.

Ruta:

`/admin`

Debe permitir:

## Dashboard

Mostrar:

- Ventas del día

- Ventas del mes

- Pedidos

- Productos

- Ticket promedio

Agregar gráficos simples:

- Ventas por día

- Pedidos por estado

- Productos más vendidos

## Productos

CRUD completo:

- Crear

- Editar

- Eliminar

- Activar/desactivar

- Precio

- Precio anterior

- Stock

- Categoría

- Imágenes

- Descripción

- Características

## Pedidos

Tabla:

- Nº pedido

- Cliente

- Fecha

- Total

- Método de entrega

- Estado

Estados:

- Pendiente

- Pagado

- Preparando

- Listo

- Enviado

- Entregado

- Cancelado

Permitir abrir un pedido y ver todos sus detalles.

## Categorías

CRUD de categorías.

## Configuración

Permitir configurar:

- Nombre del negocio

- Logo

- Datos de contacto

- Dirección

- Horarios

- Métodos de entrega

- Costos de envío

---

# BASE DE DATOS

Crear una arquitectura preparada para producción.

Entidades principales:

users

products

categories

product_images

orders

order_items

customers

addresses

payments

shipping_methods

store_settings

Cada producto debe tener:

- id

- name

- slug

- description

- price

- compare_price

- stock

- category_id

- active

- featured

- created_at

- updated_at

Cada pedido debe tener:

- id

- customer_id

- status

- payment_status

- subtotal

- shipping_cost

- total

- shipping_method

- shipping_address

- created_at

---

# EXPERIENCIA MOBILE

La mayoría del tráfico probablemente llegará desde Instagram.

Por lo tanto:

Mobile-first.

Priorizar:

- Velocidad

- Botones grandes

- Navegación sencilla

- Imágenes optimizadas

- Checkout corto

- Carrito accesible

- Buscador visible

- Filtros simples

No crear elementos pequeños difíciles de tocar.

---

# ANIMACIONES

Utilizar animaciones sutiles:

- Fade-in al cargar secciones.

- Hover en productos.

- Transición al agregar al carrito.

- Badge animado al agregar producto.

- Drawer del carrito con transición.

- Transiciones suaves entre páginas.

No abusar de las animaciones.

La prioridad es conversión y velocidad.

---

# SEO

Preparar:

- URLs amigables.

- Meta title.

- Meta description.

- Open Graph.

- Sitemap.

- Robots.txt.

- Datos estructurados de productos.

- URLs tipo:

`/tienda`

`/plantas`

`/macetas`

`/producto/nombre-del-producto`

---

# WHATSAPP

Agregar botón flotante de WhatsApp.

No debe ser invasivo.

Debe permitir contactar al vivero.

En producto, permitir:

**Consultar por WhatsApp**

generando automáticamente un mensaje con el nombre del producto.

---

# FOOTER

Columnas:

### ViveroFlor

Breve descripción.

### Comprar

- Tienda

- Plantas

- Macetas

- Accesorios

### Ayuda

- Preguntas frecuentes

- Envíos

- Medios de pago

- Contacto

### Contacto

- WhatsApp

- Instagram

- Dirección

- Horarios

Agregar redes sociales.

---

# FUNCIONALIDAD IMPORTANTE

La aplicación debe estar construida de forma modular y preparada para producción.

No utilizar datos falsos como solución definitiva.

Crear datos de ejemplo únicamente para visualizar el diseño.

Separar claramente:

- Frontend

- Backend

- Base de datos

- Autenticación

- Administración

- Pagos

El número que recibe los pedidos se configura en `whatsapp` de `src/lib/store-config.ts`.

Nunca colocar credenciales privadas en el frontend.

---

# DISEÑO UX

Reglas fundamentales:

1. El usuario siempre debe saber dónde está.

2. No esconder funcionalidades importantes.

3. No utilizar popups innecesarios.

4. No saturar la pantalla.

5. El carrito debe estar siempre accesible.

6. El checkout debe tener la menor cantidad de pasos posible.

7. Mostrar claramente precios y costos.

8. Mostrar disponibilidad antes de comprar.

9. Los errores deben explicar exactamente qué ocurrió.

10. Toda acción importante debe tener feedback visual.

---

# RESULTADO ESPERADO

El resultado debe sentirse como una **tienda online profesional de un vivero real**, no como una plantilla genérica generada por IA.

Debe tener una estética natural, moderna y premium, pero principalmente debe estar diseñada para **vender**.

Priorizar:

**Producto → Carrito → Checkout → Compra**

sobre elementos puramente decorativos.

Crear primero la experiencia completa del cliente y después el dashboard administrativo.

Usar componentes reutilizables y una arquitectura limpia que permita agregar posteriormente:

- Cupones

- Ofertas

- Productos relacionados

- Reviews

- Favoritos

- Clientes

- Analytics

- Meta Pixel

- Google Analytics

- Automatizaciones

- Más métodos de envío

- Más métodos de pago

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d7ec6790-ca65-4c09-8035-a3916224b9e8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
