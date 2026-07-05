/* =========================================================
   WARUNG NUSANTARA — MAIN.JS
   Semua logika toko: katalog, keranjang, request barang,
   dan chatbot FAQ sederhana. Tidak ada backend — checkout
   & request dikirim sebagai pesan WhatsApp ke admin.
   ========================================================= */

/* =====================================================
   1. KONFIGURASI TOKO — UBAH BAGIAN INI SESUAI KEBUTUHAN
   ===================================================== */
const CONFIG = {
  // Nomor WhatsApp admin, format internasional TANPA tanda "+" dan TANPA angka 0 di depan.
  // Contoh nomor Jepang 090-1234-5678 milik admin -> ditulis "819012345678"
  ADMIN_WHATSAPP: "819000000000",
  CURRENCY_SYMBOL: "¥",
  STORE_NAME: "Warung Nusantara",
};

// Kategori produk yang tampil sebagai chip filter.
// "id" HARUS sama persis dengan field "kategori" di data/products.json
const CATEGORIES = [
  { id: "semua", label: "Semua", icon: "🧺" },
  { id: "mie-instan", label: "Mie Instan", icon: "🍜" },
  { id: "bumbu-dapur", label: "Bumbu Dapur", icon: "🧂" },
  { id: "sembako", label: "Sembako", icon: "🍚" },
  { id: "snack", label: "Snack", icon: "🍪" },
  { id: "minuman", label: "Minuman", icon: "☕" },
  { id: "bahan-segar", label: "Bahan Segar", icon: "🧊" },
];

// Data FAQ dipakai bersama oleh accordion FAQ dan chatbot.
const FAQ_DATA = [
  {
    keywords: ["jam", "buka", "operasional", "jam berapa"],
    question: "Jam berapa admin biasanya membalas pesan?",
    answer: "Admin standby setiap hari pukul 09.00–21.00 waktu Jepang. Di luar jam itu, pesan tetap masuk dan akan dibalas paling lambat keesokan harinya.",
  },
  {
    keywords: ["ongkir", "kirim", "pengiriman", "berapa lama", "ekspedisi"],
    question: "Berapa ongkir dan berapa lama pengiriman?",
    answer: "Ongkir dihitung berdasarkan berat & prefektur tujuan menggunakan Japan Post atau Yamato. Estimasi 2–5 hari kerja. Nominal pasti dikonfirmasi admin sebelum pembayaran.",
  },
  {
    keywords: ["bayar", "pembayaran", "paypay", "transfer", "cara bayar"],
    question: "Metode pembayaran apa saja yang diterima?",
    answer: "Bisa transfer Bank Yucho/Japan Post Bank, PayPay, LINE Pay, bayar tunai di konbini, atau COD di titik kumpul tertentu. Detail rekening/QR dikirim admin saat checkout.",
  },
  {
    keywords: ["request", "barang khusus", "tidak ada", "pesan khusus", "cari barang"],
    question: "Bagaimana jika barang yang saya cari tidak ada di katalog?",
    answer: "Isi form 'Request Barang Khusus' di halaman utama, atau chat admin langsung di sini. Admin akan cek ketersediaan & kirim penawaran harga via WhatsApp.",
  },
  {
    keywords: ["halal", "sertifikat"],
    question: "Apakah semua produk halal?",
    answer: "Produk dengan label 'halal' pada katalog sudah kami tandai berdasarkan info kemasan/produsen. Untuk kepastian, selalu cek label pada kemasan yang diterima.",
  },
  {
    keywords: ["minimal", "min order", "minimum belanja"],
    question: "Apakah ada minimal belanja?",
    answer: "Tidak ada minimal belanja untuk pemesanan reguler. Namun untuk efisiensi ongkir, kami sarankan belanja bersama teman satu asrama/apartemen.",
  },
];

/* =====================================================
   2. STATE
   ===================================================== */
let allProducts = [];
let activeCategory = "semua";
let searchTerm = "";
let currentDetailProduct = null;
let detailQty = 1;
let cart = loadCart();

/* =====================================================
   3. UTIL
   ===================================================== */
function formatYen(n) {
  return CONFIG.CURRENCY_SYMBOL + Number(n).toLocaleString("ja-JP");
}
function loadCart() {
  try {
    const raw = localStorage.getItem("wn_cart_v1");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}
function saveCart() {
  try {
    localStorage.setItem("wn_cart_v1", JSON.stringify(cart));
  } catch (e) {
    /* localStorage tidak tersedia, keranjang hanya bertahan selama sesi ini */
  }
}
function findProduct(id) {
  return allProducts.find((p) => p.id === id);
}
function waLink(phoneNumber, text) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
}
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* =====================================================
   4. MEMUAT PRODUK
   ===================================================== */
async function loadProducts() {
  try {
    const res = await fetch("data/products.json");
    allProducts = await res.json();
  } catch (err) {
    console.error("Gagal memuat data/products.json. Jalankan situs lewat server lokal atau GitHub Pages, jangan buka file index.html langsung dari folder.", err);
    allProducts = [];
  }
  document.getElementById("statProdukCount").textContent = allProducts.length;
  renderCategories();
  renderGrid();
  updateCartBadge();
}

/* =====================================================
   5. KATEGORI & GRID PRODUK
   ===================================================== */
function renderCategories() {
  const el = document.getElementById("categoryScroller");
  el.innerHTML = CATEGORIES.map(
    (c) => `<button class="chip ${c.id === activeCategory ? "active" : ""}" data-cat="${c.id}">${c.icon} ${c.label}</button>`
  ).join("");
  el.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      renderCategories();
      renderGrid();
    });
  });
}

function getFilteredProducts() {
  return allProducts.filter((p) => {
    const matchCat = activeCategory === "semua" || p.kategori === activeCategory;
    const matchSearch =
      !searchTerm ||
      p.nama.toLowerCase().includes(searchTerm) ||
      p.deskripsi.toLowerCase().includes(searchTerm);
    return matchCat && matchSearch;
  });
}

function renderGrid() {
  const grid = document.getElementById("productGrid");
  const emptyNote = document.getElementById("emptyNote");
  const list = getFilteredProducts();

  if (list.length === 0) {
    grid.innerHTML = "";
    emptyNote.classList.remove("hidden");
    return;
  }
  emptyNote.classList.add("hidden");

  grid.innerHTML = list
    .map((p) => {
      const lowStock = p.stok <= 5 && p.stok > 0;
      const outOfStock = p.stok <= 0;
      return `
      <article class="product-card" data-id="${p.id}">
        <div class="product-media">
          ${p.emoji || "🛍️"}
          ${p.unggulan ? '<span class="badge-fav">Favorit</span>' : ""}
        </div>
        <div class="product-name">${p.nama}</div>
        <div class="product-unit">${p.satuan}${outOfStock ? " · Habis" : lowStock ? ` · <span class="stock-low">Sisa ${p.stok}</span>` : ""}</div>
        <div class="price-tag">
          <span class="price">${formatYen(p.harga)}</span>
          <button class="add-btn" data-quickadd="${p.id}" aria-label="Tambah cepat" ${outOfStock ? "disabled style='opacity:.4'" : ""}>+</button>
        </div>
      </article>`;
    })
    .join("");

  grid.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("[data-quickadd]")) return; // ditangani terpisah
      openDetail(card.dataset.id);
    });
  });
  grid.querySelectorAll("[data-quickadd]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(btn.dataset.quickadd, 1);
      showToast("Ditambahkan ke keranjang 🛒");
    });
  });
}

/* =====================================================
   6. DETAIL PRODUK (BOTTOM SHEET)
   ===================================================== */
function openDetail(id) {
  const p = findProduct(id);
  if (!p) return;
  currentDetailProduct = p;
  detailQty = 1;

  document.getElementById("detailMedia").textContent = p.emoji || "🛍️";
  document.getElementById("detailName").textContent = p.nama;
  document.getElementById("detailUnit").textContent = p.satuan + (p.stok <= 5 ? ` · Sisa ${p.stok}` : "");
  document.getElementById("detailDesc").textContent = p.deskripsi;
  document.getElementById("detailPrice").textContent = formatYen(p.harga);
  document.getElementById("detailQty").textContent = detailQty;
  document.getElementById("detailTags").innerHTML = (p.tag || [])
    .map((t) => `<span class="tag-pill">${t}</span>`)
    .join("");

  document.getElementById("detailOverlay").classList.add("open");
}
function closeDetail() {
  document.getElementById("detailOverlay").classList.remove("open");
}

/* =====================================================
   7. KERANJANG
   ===================================================== */
function addToCart(id, qty) {
  cart[id] = (cart[id] || 0) + qty;
  saveCart();
  updateCartBadge();
}
function setCartQty(id, qty) {
  if (qty <= 0) {
    delete cart[id];
  } else {
    cart[id] = qty;
  }
  saveCart();
  updateCartBadge();
  renderCartItems();
}
function removeFromCart(id) {
  delete cart[id];
  saveCart();
  updateCartBadge();
  renderCartItems();
}
function cartCount() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}
function cartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = findProduct(id);
    return sum + (p ? p.harga * qty : 0);
  }, 0);
}
function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  const count = cartCount();
  badge.textContent = count;
  badge.classList.toggle("hidden", count === 0);
}
function renderCartItems() {
  const wrap = document.getElementById("cartItems");
  const emptyNote = document.getElementById("cartEmptyNote");
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    wrap.innerHTML = "";
    emptyNote.classList.remove("hidden");
  } else {
    emptyNote.classList.add("hidden");
    wrap.innerHTML = entries
      .map(([id, qty]) => {
        const p = findProduct(id);
        if (!p) return "";
        return `
        <div class="cart-item" data-id="${id}">
          <div class="mini-media">${p.emoji || "🛍️"}</div>
          <div class="info">
            <div class="name">${p.nama}</div>
            <div class="sub">${formatYen(p.harga)} / ${p.satuan}</div>
          </div>
          <div class="qty-control">
            <button data-act="minus">−</button>
            <span>${qty}</span>
            <button data-act="plus">+</button>
          </div>
          <button class="cart-remove" data-act="remove">Hapus</button>
        </div>`;
      })
      .join("");

    wrap.querySelectorAll(".cart-item").forEach((row) => {
      const id = row.dataset.id;
      row.querySelector('[data-act="minus"]').addEventListener("click", () => setCartQty(id, (cart[id] || 0) - 1));
      row.querySelector('[data-act="plus"]').addEventListener("click", () => setCartQty(id, (cart[id] || 0) + 1));
      row.querySelector('[data-act="remove"]').addEventListener("click", () => removeFromCart(id));
    });
  }

  document.getElementById("cartSubtotal").textContent = formatYen(cartTotal());
  document.getElementById("cartTotal").textContent = formatYen(cartTotal());
}
function openCart() {
  renderCartItems();
  document.getElementById("cartOverlay").classList.add("open");
}
function closeCart() {
  document.getElementById("cartOverlay").classList.remove("open");
}

function buildCheckoutMessage() {
  const lines = [`Halo Admin ${CONFIG.STORE_NAME}, saya mau pesan:`, ""];
  Object.entries(cart).forEach(([id, qty]) => {
    const p = findProduct(id);
    if (!p) return;
    lines.push(`- ${p.nama} (${qty}x ${p.satuan}) = ${formatYen(p.harga * qty)}`);
  });
  lines.push("", `Total: ${formatYen(cartTotal())}`, "", "Mohon info ongkir & cara pembayarannya. Terima kasih!");
  return lines.join("\n");
}

/* =====================================================
   8. FORM REQUEST BARANG KHUSUS
   ===================================================== */
function handleRequestSubmit(e) {
  e.preventDefault();
  const nama = document.getElementById("reqNama").value.trim();
  const kontak = document.getElementById("reqKontak").value.trim();
  const barang = document.getElementById("reqBarang").value.trim();
  const jumlah = document.getElementById("reqJumlah").value.trim();
  const catatan = document.getElementById("reqCatatan").value.trim();

  const text = [
    `Halo Admin ${CONFIG.STORE_NAME}, saya mau request barang khusus:`,
    "",
    `Nama: ${nama}`,
    `Kontak: ${kontak}`,
    `Barang dicari: ${barang}`,
    jumlah ? `Perkiraan jumlah: ${jumlah}` : null,
    catatan ? `Catatan: ${catatan}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  window.open(waLink(CONFIG.ADMIN_WHATSAPP, text), "_blank");
  showToast("Membuka WhatsApp admin...");
  e.target.reset();
}

/* =====================================================
   9. FAQ ACCORDION
   ===================================================== */
function renderFaqAccordion() {
  const el = document.getElementById("faqList");
  el.innerHTML = FAQ_DATA.map(
    (f, i) => `
    <div class="faq-item" data-i="${i}">
      <div class="faq-q">${f.question}<span class="chev">⌄</span></div>
      <div class="faq-a">${f.answer}</div>
    </div>`
  ).join("");
  el.querySelectorAll(".faq-item").forEach((item) => {
    item.querySelector(".faq-q").addEventListener("click", () => item.classList.toggle("open"));
  });
}

/* =====================================================
   10. CHATBOT SEDERHANA (rule-based, tanpa server)
   ===================================================== */
function appendChatMessage(text, sender) {
  const body = document.getElementById("chatBody");
  const div = document.createElement("div");
  div.className = `msg ${sender}`;
  div.textContent = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function renderChatSuggestions() {
  const wrap = document.getElementById("chatSuggestions");
  wrap.innerHTML = FAQ_DATA.map((f, i) => `<button class="sugg-btn" data-i="${i}">${f.question}</button>`).join("");
  wrap.querySelectorAll(".sugg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = FAQ_DATA[btn.dataset.i];
      appendChatMessage(f.question, "user");
      setTimeout(() => appendChatMessage(f.answer, "bot"), 350);
    });
  });
}

function botReplyFor(userText) {
  const lower = userText.toLowerCase();
  const found = FAQ_DATA.find((f) => f.keywords.some((k) => lower.includes(k)));
  if (found) return found.answer;
  return "__FALLBACK__";
}

function handleChatSend() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  appendChatMessage(text, "user");
  input.value = "";

  setTimeout(() => {
    const reply = botReplyFor(text);
    if (reply === "__FALLBACK__") {
      appendChatMessage("Maaf, saya belum punya jawaban otomatis untuk itu. Yuk lanjut chat langsung ke admin manusia 👇", "bot");
      const body = document.getElementById("chatBody");
      const link = document.createElement("a");
      link.href = waLink(CONFIG.ADMIN_WHATSAPP, `Halo Admin, saya ada pertanyaan: ${text}`);
      link.target = "_blank";
      link.className = "btn-primary";
      link.style.display = "block";
      link.style.textAlign = "center";
      link.style.textDecoration = "none";
      link.style.marginTop = "4px";
      link.textContent = "Chat Admin di WhatsApp";
      body.appendChild(link);
      body.scrollTop = body.scrollHeight;
    } else {
      appendChatMessage(reply, "bot");
    }
  }, 400);
}

function openChat() {
  document.getElementById("chatPanel").classList.add("open");
}
function closeChat() {
  document.getElementById("chatPanel").classList.remove("open");
}

/* =====================================================
   11. INISIALISASI & EVENT LISTENERS
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("thisYear").textContent = new Date().getFullYear();
  document.getElementById("footerWaLink").href = waLink(
    CONFIG.ADMIN_WHATSAPP,
    `Halo Admin ${CONFIG.STORE_NAME}, saya mau tanya-tanya.`
  );

  loadProducts();
  renderFaqAccordion();

  // Chat awal
  appendChatMessage(`Halo! 👋 Saya asisten virtual ${CONFIG.STORE_NAME}. Tanya soal ongkir, pembayaran, atau cara request barang ya.`, "bot");
  renderChatSuggestions();

  // Search
  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderGrid();
  });
  document.getElementById("resetFilter").addEventListener("click", () => {
    activeCategory = "semua";
    searchTerm = "";
    document.getElementById("searchInput").value = "";
    renderCategories();
    renderGrid();
  });

  // Detail sheet
  document.getElementById("closeDetail").addEventListener("click", closeDetail);
  document.getElementById("detailOverlay").addEventListener("click", (e) => {
    if (e.target.id === "detailOverlay") closeDetail();
  });
  document.getElementById("detailMinus").addEventListener("click", () => {
    detailQty = Math.max(1, detailQty - 1);
    document.getElementById("detailQty").textContent = detailQty;
  });
  document.getElementById("detailPlus").addEventListener("click", () => {
    detailQty += 1;
    document.getElementById("detailQty").textContent = detailQty;
  });
  document.getElementById("detailAdd").addEventListener("click", () => {
    if (!currentDetailProduct) return;
    addToCart(currentDetailProduct.id, detailQty);
    showToast(`${detailQty}x ${currentDetailProduct.nama} ditambahkan`);
    closeDetail();
  });

  // Cart sheet
  document.getElementById("btnOpenCart").addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCart);
  document.getElementById("btnContinueShopping").addEventListener("click", closeCart);
  document.getElementById("cartOverlay").addEventListener("click", (e) => {
    if (e.target.id === "cartOverlay") closeCart();
  });
  document.getElementById("btnCheckout").addEventListener("click", () => {
    if (cartCount() === 0) {
      showToast("Keranjang masih kosong");
      return;
    }
    window.open(waLink(CONFIG.ADMIN_WHATSAPP, buildCheckoutMessage()), "_blank");
  });

  // Request form
  document.getElementById("requestForm").addEventListener("submit", handleRequestSubmit);

  // Chat panel
  document.getElementById("btnOpenChat").addEventListener("click", openChat);
  document.getElementById("chatFab").addEventListener("click", openChat);
  document.getElementById("btnCloseChat").addEventListener("click", closeChat);
  document.getElementById("chatSend").addEventListener("click", handleChatSend);
  document.getElementById("chatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleChatSend();
  });

  // Bottom nav — scroll ke section & tandai aktif
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.target);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
});
