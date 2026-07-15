/* =====================================================================
   CBA STORE — script.js
   =====================================================================

   👉 COACH: AQUÍ ES DONDE SUBES TUS PRODUCTOS. ES SÚPER FÁCIL.

   Para agregar un producto nuevo, copia y pega este bloque
   dentro de la lista "productos" y cambia los datos:

     {
       id: 7,                          // un número único (no repetir)
       nombre: "Nombre del producto",
       categoria: "Guantes",           // Guantes, Vendas, Protección, Calzado, Ropa
       precio: 39.99,                  // solo el número, sin el signo $
       imagen: "URL_DE_LA_FOTO",       // link de una foto (https://...)
       badge: "NUEVO"                  // etiqueta amarilla (o pon "" si no quieres)
     },

   💡 PARA LA FOTO: sube tu imagen a un lugar como Google Drive (compartida
      como pública), Imgur, o usa el link directo de la foto del producto.
   ===================================================================== */

const productos = [
  {
    id: 1,
    nombre: "Vendas Profesionales 180cm (par)",
    categoria: "Vendas",
    precio: 12.99,
    imagen: "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?w=500",
    badge: "MÁS VENDIDO"
  },
  {
    id: 2,
    nombre: "Guantes de Boxeo 16oz — Aprobados",
    categoria: "Guantes",
    precio: 49.99,
    imagen: "https://images.unsplash.com/photo-1517438322307-e67111335449?w=500",
    badge: ""
  },
  {
    id: 3,
    nombre: "Protector Bucal Doble",
    categoria: "Protección",
    precio: 9.99,
    imagen: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=500",
    badge: ""
  },
  {
    id: 4,
    nombre: "Casco de Protección — USA Boxing",
    categoria: "Protección",
    precio: 64.99,
    imagen: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=500",
    badge: "NUEVO"
  },
  {
    id: 5,
    nombre: "Zapatos de Boxeo — Velocidad",
    categoria: "Calzado",
    precio: 79.99,
    imagen: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    badge: ""
  },
  {
    id: 6,
    nombre: "Camiseta CBA Oficial",
    categoria: "Ropa",
    precio: 24.99,
    imagen: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    badge: ""
  },
];

/* =====================================================================
   ⚙️ CONFIGURACIÓN — CAMBIA ESTOS DATOS POR LOS TUYOS
   ===================================================================== */

// 👉 TU NÚMERO DE WHATSAPP (con código de país, sin + ni espacios)
//    Ejemplo USA: 17025551234
const WHATSAPP_NUMERO = "1XXXXXXXXXX";

// 👉 TU LINK DE STRIPE (pago con tarjeta). Pega aquí tu link de pago.
//    Cuando tengas el link de Stripe, pégalo entre las comillas.
const STRIPE_LINK = "";

/* =====================================================================
   ⬇️ DE AQUÍ PARA ABAJO ES EL MOTOR DE LA TIENDA.
      No necesitas tocar nada, pero puedes leerlo si quieres.
   ===================================================================== */

let carrito = [];
let filtroActual = "Todos";
let busqueda = "";

// --- Render de filtros por categoría ---
function renderFiltros() {
  const cats = ["Todos", ...new Set(productos.map(p => p.categoria))];
  const cont = document.getElementById("filtros");
  cont.innerHTML = cats.map(c =>
    `<button class="filtro-btn ${c === filtroActual ? 'active' : ''}" data-cat="${c}">${c}</button>`
  ).join("");
  cont.querySelectorAll(".filtro-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      filtroActual = btn.dataset.cat;
      renderFiltros();
      renderProductos();
    });
  });
}

// --- Render de la cuadrícula de productos ---
function renderProductos() {
  const grid = document.getElementById("productosGrid");
  let lista = productos;

  if (filtroActual !== "Todos") lista = lista.filter(p => p.categoria === filtroActual);
  if (busqueda) lista = lista.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  if (lista.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#8B8B99;padding:40px">No se encontraron productos.</p>`;
    return;
  }

  grid.innerHTML = lista.map(p => `
    <div class="producto-card">
      <div class="producto-img-wrap">
        ${p.badge ? `<span class="producto-badge">${p.badge}</span>` : ""}
        <img class="producto-img" src="${p.imagen}" alt="${p.nombre}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/500x500/1A1A22/FF5A1F?text=CBA+Store'">
      </div>
      <div class="producto-info">
        <span class="producto-cat">${p.categoria}</span>
        <h3 class="producto-titulo">${p.nombre}</h3>
        <p class="producto-precio">$${p.precio.toFixed(2)}</p>
        <button class="add-btn" data-id="${p.id}">Añadir al carrito</button>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => agregarAlCarrito(Number(btn.dataset.id)));
  });
}

// --- Agregar al carrito ---
function agregarAlCarrito(id) {
  const prod = productos.find(p => p.id === id);
  const enCarrito = carrito.find(item => item.id === id);
  if (enCarrito) {
    enCarrito.cantidad++;
  } else {
    carrito.push({ ...prod, cantidad: 1 });
  }
  actualizarCarrito();
  abrirCarrito();
}

// --- Cambiar cantidad ---
function cambiarCantidad(id, delta) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) carrito = carrito.filter(i => i.id !== id);
  actualizarCarrito();
}

// --- Quitar producto ---
function quitarDelCarrito(id) {
  carrito = carrito.filter(i => i.id !== id);
  actualizarCarrito();
}

// --- Actualizar vista del carrito ---
function actualizarCarrito() {
  const cont = document.getElementById("cartItems");
  const count = carrito.reduce((s, i) => s + i.cantidad, 0);
  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);

  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTotal").textContent = "$" + total.toFixed(2);

  if (carrito.length === 0) {
    cont.innerHTML = `<div class="cart-empty">Tu carrito está vacío.<br>¡Agrega productos! 🥊</div>`;
    return;
  }

  cont.innerHTML = carrito.map(i => `
    <div class="cart-item">
      <img src="${i.imagen}" alt="${i.nombre}"
           onerror="this.src='https://via.placeholder.com/64/1A1A22/FF5A1F?text=CBA'">
      <div class="cart-item-info">
        <p class="cart-item-title">${i.nombre}</p>
        <p class="cart-item-price">$${(i.precio * i.cantidad).toFixed(2)}</p>
        <div class="cart-qty">
          <button class="qty-btn" data-minus="${i.id}">−</button>
          <span>${i.cantidad}</span>
          <button class="qty-btn" data-plus="${i.id}">+</button>
        </div>
        <button class="cart-item-remove" data-remove="${i.id}">Quitar</button>
      </div>
    </div>
  `).join("");

  cont.querySelectorAll("[data-plus]").forEach(b => b.onclick = () => cambiarCantidad(Number(b.dataset.plus), 1));
  cont.querySelectorAll("[data-minus]").forEach(b => b.onclick = () => cambiarCantidad(Number(b.dataset.minus), -1));
  cont.querySelectorAll("[data-remove]").forEach(b => b.onclick = () => quitarDelCarrito(Number(b.dataset.remove)));
}

// --- Abrir / cerrar carrito ---
function abrirCarrito() {
  document.getElementById("cartPanel").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
}
function cerrarCarrito() {
  document.getElementById("cartPanel").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
}

// --- Armar mensaje de pedido para WhatsApp ---
function mensajePedidoWhatsApp() {
  if (carrito.length === 0) return "Hola Coach, quiero información sobre sus productos.";
  let msg = "🥊 *NUEVO PEDIDO — CBA Store*%0A%0A";
  carrito.forEach(i => {
    msg += `• ${i.cantidad}x ${i.nombre} — $${(i.precio * i.cantidad).toFixed(2)}%0A`;
  });
  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  msg += `%0A*TOTAL: $${total.toFixed(2)}*%0A%0A`;
  msg += "Mi nombre es: %0AMi dirección de envío es: ";
  return msg;
}

// --- Finalizar compra (Stripe si hay link, si no WhatsApp) ---
function finalizarCompra() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío. Agrega productos primero.");
    return;
  }
  if (STRIPE_LINK && STRIPE_LINK.startsWith("http")) {
    // Si tienes link de Stripe, lleva al pago con tarjeta
    window.open(STRIPE_LINK, "_blank");
  } else {
    // Si aún no hay Stripe, manda el pedido por WhatsApp
    window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${mensajePedidoWhatsApp()}`, "_blank");
  }
}

// --- Pedir por WhatsApp (botón verde del carrito) ---
function pedirPorWhatsApp() {
  window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${mensajePedidoWhatsApp()}`, "_blank");
}

// --- Conectar todos los botones ---
document.addEventListener("DOMContentLoaded", () => {
  renderFiltros();
  renderProductos();
  actualizarCarrito();

  document.getElementById("cartBtn").onclick = abrirCarrito;
  document.getElementById("cartClose").onclick = cerrarCarrito;
  document.getElementById("cartOverlay").onclick = cerrarCarrito;
  document.getElementById("footerCart").onclick = (e) => { e.preventDefault(); abrirCarrito(); };
  document.getElementById("checkoutBtn").onclick = finalizarCompra;
  document.getElementById("whatsappOrderBtn").onclick = pedirPorWhatsApp;

  // Botón flotante de WhatsApp
  document.getElementById("whatsappFloat").onclick = (e) => {
    e.preventDefault();
    window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=Hola Coach, quiero información sobre sus productos 🥊`, "_blank");
  };

  // Buscador
  document.getElementById("searchInput").addEventListener("input", (e) => {
    busqueda = e.target.value;
    renderProductos();
  });
});
