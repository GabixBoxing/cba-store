/* =====================================================================
   VENDOSHOP — script.js
   =====================================================================

   👉 AQUÍ SUBES TUS PRODUCTOS. ES MUY FÁCIL.

   Para agregar un producto nuevo, copia y pega este bloque completo
   dentro de la lista "productos" (antes del corchete final ]) y cambia
   los datos por los de tu producto:

     {
       id: 99,                                  // número único, no repetir
       nombre: "Nombre de tu producto",
       categoria: "Categoría",                  // ej: Ropa, Hogar, Electrónica, Belleza...
       precio: 29.99,                           // solo el número, sin $
       descripcion: "Describe tu producto aquí, sus detalles y beneficios.",
       badge: "OFERTA",                         // etiqueta verde (o pon "" si no quieres)
       fotos: [                                 // 👈 AQUÍ VAN VARIAS FOTOS (galería)
         "URL_FOTO_1",
         "URL_FOTO_2",
         "URL_FOTO_3"
       ]
     },

   💡 IMPORTANTE SOBRE LAS FOTOS:
      - Puedes poner 1, 2, 3 o más fotos por producto. Van entre comillas
        y separadas por comas, dentro de los corchetes de "fotos".
      - Para conseguir el link (URL) de una foto:
        1) Sube tu foto a Google Drive, hazla pública, y copia el link, O
        2) Usa un sitio gratis como imgur.com o postimages.org, O
        3) Copia la dirección de una foto que ya esté en internet
           (clic derecho sobre la foto -> "Copiar dirección de imagen").
   ===================================================================== */

const productos = [
  {
    id: 1,
    nombre: "Producto de Ejemplo 1",
    categoria: "General",
    precio: 19.99,
    descripcion: "Este es un producto de ejemplo. Cambia el nombre, precio, descripción y fotos por los de tu producto real.",
    badge: "NUEVO",
    fotos: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600"
    ]
  },
  {
    id: 2,
    nombre: "Producto de Ejemplo 2",
    categoria: "General",
    precio: 34.99,
    descripcion: "Otro producto de ejemplo con varias fotos. El cliente puede deslizar para ver todas las imágenes.",
    badge: "",
    fotos: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600"
    ]
  },
  {
    id: 3,
    nombre: "Producto de Ejemplo 3",
    categoria: "General",
    precio: 49.99,
    descripcion: "Producto con descripción más larga para mostrar cómo se ve. Aquí explicas los detalles y beneficios de lo que vendes.",
    badge: "OFERTA",
    fotos: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600"
    ]
  },
  {
    id: 4,
    nombre: "Producto de Ejemplo 4",
    categoria: "General",
    precio: 24.99,
    descripcion: "Un producto más. Copia este bloque cuantas veces necesites para agregar todos tus productos.",
    badge: "",
    fotos: [
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600"
    ]
  },
];

/* =====================================================================
   ⚙️ CONFIGURACIÓN — CAMBIA ESTOS DATOS POR LOS TUYOS
   ===================================================================== */

// 👉 TU NÚMERO DE WHATSAPP (con código de país, sin + ni espacios)
//    Ejemplo USA: 17025551234
const WHATSAPP_NUMERO = "1XXXXXXXXXX";

// 👉 TU LINK DE STRIPE (pago con tarjeta). Pega aquí tu link cuando lo tengas.
const STRIPE_LINK = "";

// 👉 NOMBRE DE TU TIENDA (para el mensaje de WhatsApp)
const NOMBRE_TIENDA = "VendoShop";

/* =====================================================================
   ⬇️ DE AQUÍ PARA ABAJO ES EL MOTOR DE LA TIENDA.
      No necesitas tocar nada.
   ===================================================================== */

let carrito = [];
let filtroActual = "Todos";
let busqueda = "";
let modalProducto = null;
let modalFotoIndex = 0;

// --- Filtros por categoría ---
function renderFiltros() {
  const cats = ["Todos", ...new Set(productos.map(p => p.categoria))];
  const cont = document.getElementById("filtros");
  cont.innerHTML = cats.map(c =>
    `<button class="filtro-btn ${c === filtroActual ? 'active' : ''}" data-cat="${c}">${c}</button>`
  ).join("");
  cont.querySelectorAll(".filtro-btn").forEach(btn => {
    btn.onclick = () => { filtroActual = btn.dataset.cat; renderFiltros(); renderProductos(); };
  });
}

// --- Cuadrícula de productos ---
function renderProductos() {
  const grid = document.getElementById("productosGrid");
  let lista = productos;
  if (filtroActual !== "Todos") lista = lista.filter(p => p.categoria === filtroActual);
  if (busqueda) lista = lista.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  if (lista.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:rgba(240,253,244,.6);padding:40px">No se encontraron productos.</p>`;
    return;
  }

  grid.innerHTML = lista.map(p => `
    <div class="producto-card" data-id="${p.id}">
      <div class="card-img-wrap">
        ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ""}
        ${p.fotos.length > 1 ? `<span class="card-photo-count">📷 ${p.fotos.length}</span>` : ""}
        <img class="card-img" src="${p.fotos[0]}" alt="${p.nombre}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/600/e5e7eb/10b981?text=Sube+tu+foto'">
        ${p.fotos.length > 1 ? `<div class="card-gallery-dots">${p.fotos.map((_, idx) => `<span class="gdot ${idx===0?'active':''}"></span>`).join("")}</div>` : ""}
      </div>
      <div class="producto-info">
        <span class="producto-cat">${p.categoria}</span>
        <h3 class="producto-titulo">${p.nombre}</h3>
        <p class="producto-precio">$${p.precio.toFixed(2)}</p>
        <button class="add-btn" data-add="${p.id}">Añadir al carrito</button>
      </div>
    </div>
  `).join("");

  // Click en la tarjeta abre el modal con galería
  grid.querySelectorAll(".producto-card").forEach(card => {
    card.onclick = (e) => {
      if (e.target.dataset.add) return; // si tocó "añadir", no abrir modal
      abrirModal(Number(card.dataset.id));
    };
  });
  grid.querySelectorAll("[data-add]").forEach(btn => {
    btn.onclick = (e) => { e.stopPropagation(); agregarAlCarrito(Number(btn.dataset.add)); };
  });

  // Auto-rotar los puntitos de galería en hover (vista previa)
  grid.querySelectorAll(".producto-card").forEach(card => {
    const p = productos.find(x => x.id === Number(card.dataset.id));
    if (!p || p.fotos.length < 2) return;
    const img = card.querySelector(".card-img");
    const dots = card.querySelectorAll(".gdot");
    let idx = 0, timer = null;
    card.onmouseenter = () => {
      timer = setInterval(() => {
        idx = (idx + 1) % p.fotos.length;
        img.src = p.fotos[idx];
        dots.forEach((d, di) => d.classList.toggle("active", di === idx));
      }, 900);
    };
    card.onmouseleave = () => {
      clearInterval(timer); idx = 0; img.src = p.fotos[0];
      dots.forEach((d, di) => d.classList.toggle("active", di === 0));
    };
  });
}

// --- Modal de producto con galería ---
function abrirModal(id) {
  modalProducto = productos.find(p => p.id === id);
  modalFotoIndex = 0;
  renderModal();
  document.getElementById("productoModal").classList.add("open");
  document.getElementById("modalOverlay").classList.add("open");
}
function cerrarModal() {
  document.getElementById("productoModal").classList.remove("open");
  document.getElementById("modalOverlay").classList.remove("open");
}
function renderModal() {
  const p = modalProducto;
  const body = document.getElementById("modalBody");
  body.innerHTML = `
    <div class="modal-gallery">
      <img class="modal-main-img" src="${p.fotos[modalFotoIndex]}" alt="${p.nombre}"
           onerror="this.src='https://via.placeholder.com/600/e5e7eb/10b981?text=Sube+tu+foto'">
      ${p.fotos.length > 1 ? `
        <button class="modal-arrow prev" data-prev>‹</button>
        <button class="modal-arrow next" data-next>›</button>
      ` : ""}
    </div>
    ${p.fotos.length > 1 ? `
      <div class="modal-thumbs">
        ${p.fotos.map((f, i) => `<img class="modal-thumb ${i===modalFotoIndex?'active':''}" src="${f}" data-thumb="${i}"
             onerror="this.src='https://via.placeholder.com/60/e5e7eb/10b981?text=+'">`).join("")}
      </div>
    ` : ""}
    <div class="modal-info">
      <span class="modal-cat">${p.categoria}</span>
      <h2 class="modal-titulo">${p.nombre}</h2>
      <p class="modal-desc">${p.descripcion || ""}</p>
      <p class="modal-precio">$${p.precio.toFixed(2)}</p>
      <button class="modal-add" data-modaladd="${p.id}">Añadir al carrito 🛒</button>
    </div>
  `;
  body.querySelector("[data-prev]") && (body.querySelector("[data-prev]").onclick = () => cambiarFoto(-1));
  body.querySelector("[data-next]") && (body.querySelector("[data-next]").onclick = () => cambiarFoto(1));
  body.querySelectorAll("[data-thumb]").forEach(t => t.onclick = () => { modalFotoIndex = Number(t.dataset.thumb); renderModal(); });
  body.querySelector("[data-modaladd]").onclick = () => { agregarAlCarrito(p.id); cerrarModal(); };
}
function cambiarFoto(dir) {
  const total = modalProducto.fotos.length;
  modalFotoIndex = (modalFotoIndex + dir + total) % total;
  renderModal();
}

// --- Carrito ---
function agregarAlCarrito(id) {
  const prod = productos.find(p => p.id === id);
  const enCarrito = carrito.find(item => item.id === id);
  if (enCarrito) enCarrito.cantidad++;
  else carrito.push({ id: prod.id, nombre: prod.nombre, precio: prod.precio, foto: prod.fotos[0], cantidad: 1 });
  actualizarCarrito();
  abrirCarrito();
}
function cambiarCantidad(id, delta) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) carrito = carrito.filter(i => i.id !== id);
  actualizarCarrito();
}
function quitarDelCarrito(id) { carrito = carrito.filter(i => i.id !== id); actualizarCarrito(); }

function actualizarCarrito() {
  const cont = document.getElementById("cartItems");
  const count = carrito.reduce((s, i) => s + i.cantidad, 0);
  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTotal").textContent = "$" + total.toFixed(2);

  if (carrito.length === 0) {
    cont.innerHTML = `<div class="cart-empty">Tu carrito está vacío.<br>¡Agrega productos! 🛍️</div>`;
    return;
  }
  cont.innerHTML = carrito.map(i => `
    <div class="cart-item">
      <img src="${i.foto}" alt="${i.nombre}" onerror="this.src='https://via.placeholder.com/64/e5e7eb/10b981?text=+'">
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

function abrirCarrito() {
  document.getElementById("cartPanel").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
}
function cerrarCarrito() {
  document.getElementById("cartPanel").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
}

// --- Mensaje de pedido para WhatsApp ---
function mensajePedidoWhatsApp() {
  if (carrito.length === 0) return `Hola, quiero información sobre los productos de ${NOMBRE_TIENDA}.`;
  let msg = `🛍️ *NUEVO PEDIDO — ${NOMBRE_TIENDA}*%0A%0A`;
  carrito.forEach(i => { msg += `• ${i.cantidad}x ${i.nombre} — $${(i.precio * i.cantidad).toFixed(2)}%0A`; });
  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  msg += `%0A*TOTAL: $${total.toFixed(2)}*%0A%0AMi nombre es: %0AMi dirección de envío es: `;
  return msg;
}

function finalizarCompra() {
  if (carrito.length === 0) { alert("Tu carrito está vacío. Agrega productos primero."); return; }
  if (STRIPE_LINK && STRIPE_LINK.startsWith("http")) window.open(STRIPE_LINK, "_blank");
  else window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${mensajePedidoWhatsApp()}`, "_blank");
}
function pedirPorWhatsApp() {
  window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${mensajePedidoWhatsApp()}`, "_blank");
}

// --- Iniciar ---
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
  document.getElementById("modalClose").onclick = cerrarModal;
  document.getElementById("modalOverlay").onclick = cerrarModal;

  document.getElementById("whatsappFloat").onclick = (e) => {
    e.preventDefault();
    window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=Hola, quiero información sobre sus productos 🛍️`, "_blank");
  };
  document.getElementById("searchInput").addEventListener("input", (e) => {
    busqueda = e.target.value; renderProductos();
  });
});
