/* =========================================================
   WARUNG NUSANTARA — MAIN.JS (Versi Supabase)
   
   Perubahan dari versi statis:
   - Produk dimuat dari Supabase database (bukan file JSON)
   - Request barang khusus tersimpan ke database
   - Keranjang masih localStorage (UX cepat, sinkron ke DB saat checkout)
   - Checkout membuat record order di database lalu buka WhatsApp
   - Fallback ke products.json jika Supabase belum dikonfigurasi
   ========================================================= */

/* =====================================================
   1. KONFIGURASI TOKO — UBAH BAGIAN INI SESUAI KEBUTUHAN
   ===================================================== */
const CONFIG = {
  // Nomor WhatsApp admin, format internasional TANPA tanda "+" dan TANPA angka 0 di depan.
  // Contoh nomor Indonesia 0812-3456-7890 -> ditulis "6281234567890"
  // Catatan: jika Supabase sudah dikonfigurasi, nilai ini akan otomatis diambil dari database
  ADMIN_WHATSAPP: "6281234567890",
  CURRENCY_SYMBOL: "¥",
  STORE_NAME: "Warung Nusantara",
};

// Kategori produk yang tampil sebagai chip filter.
// "id" HARUS sama persis dengan field "kategori" di database/products.json
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
    answer: "Admin standby setiap hari pukul 09.00–21.00 WIB / 11.00–23.00 WIJ. Di luar jam itu, pesan tetap masuk dan akan dibalas paling lambat keesokan harinya.",
  },
  {
    keywords: ["ongkir", "kirim", "pengiriman", "berapa lama", "ekspedisi"],
    question: "Berapa ongkir dan berapa lama pengiriman?",
    answer: "Ongkir dihitung berdasarkan berat & prefektur tujuan menggunakan Japan Post atau Yamato. Estimasi 2–5 hari kerja. Nominal pasti dikonfirmasi admin sebelum pembayaran.",
  },
  {
    keywords: ["bayar", "pembayaran", "transfer", "cara bayar", "bca", "bri", "mandiri", "qris"],
    question: "Metode pembayaran apa saja yang diterima?",
    answer: "Bisa transfer Bank Indonesia (BCA, BRI, Mandiri) atau QRIS. Detail nomor rekening dan QR dikirim admin saat checkout. Setelah transfer, upload bukti bayar di halaman konfirmasi pembayaran.",
  },
  {
    keywords: ["request", "barang khusus", "tidak ada", "pesan khusus", "cari barang"],
    question: "Bagaimana jika barang yang saya cari tidak ada di katalog?",
    answer: "Isi form 'Request Barang Khusus' di halaman utama, atau chat admin langsung. Admin akan cek ketersediaan & kirim penawaran harga via WhatsApp.",
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
  {
    keywords: ["lacak", "status", "pesanan", "order"],
    question: "Bagaimana cara lacak status pesanan saya?",
    answer: "Setelah checkout, Anda mendapat nomor pesanan (contoh: WN-20240705-0001). Admin akan update status via WhatsApp. Bukti transfer dikirim lewat halaman konfirmasi pembayaran.",
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
    const raw = localStorage.getItem("wn_cart_v2");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}
function saveCart() {
  try {
    localStorage.setItem("wn_cart_v2", JSON.stringify(cart));
  } catch (e) {
    /* localStorage tidak tersedia */
  }
}
function findProduct(id) {
  return allProducts.find((p) => p.id === id);
}
function waLink(phoneNumber, text) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
}
function showToast(msg, type = "default") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2800);
}

/* =====================================================
   4. MEMUAT PRODUK (dari Supabase atau fallback JSON)
   ===================================================== */
async function loadProducts() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = `<div class="loading-skeleton">
    ${Array(6).fill('<div class="skeleton-card"></div>').join("")}
  </div>`;

  // Coba load pengaturan toko dari Supabase
  await loadStoreSettings();

  // Coba load produk dari Supabase
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("products")
        .select("*")
        .eq("aktif", true)
        .order("unggulan", { ascending: false })
        .order("nama");

      if (error) throw error;
      allProducts = data || [];
      console.log(`✅ ${allProducts.length} produk dimuat dari Supabase`);
    } catch (err) {
      console.error("Gagal memuat produk dari Supabase, menggunakan fallback JSON:", err);
      await loadProductsFromJson();
    }
  } else {
    // Fallback ke file JSON jika Supabase belum dikonfigurasi
    console.info("ℹ️ Supabase belum dikonfigurasi. Menggunakan data/products.json (mode statis).");
    await loadProductsFromJson();
  }

  document.getElementById("statProdukCount").textContent = allProducts.length;
  renderCategories();
  renderGrid();
  updateCartBadge();
}

async function loadProductsFromJson() {
  try {
    const res = await fetch("data/products.json");
    allProducts = await res.json();
  } catch (err) {
    console.error("Gagal memuat data/products.json:", err);
    allProducts = [];
  }
}

async function loadStoreSettings() {
  if (!isSupabaseConfigured()) return;
  try {
    const sb = getSupabase();
    const { data } = await sb.from("store_settings").select("key,value");
    if (data) {
      const settings = Object.fromEntries(data.map((r) => [r.key, r.value]));
      if (settings.whatsapp_admin) CONFIG.ADMIN_WHATSAPP = settings.whatsapp_admin;
      if (settings.store_name) CONFIG.STORE_NAME = settings.store_name;
    }
  } catch (err) {
    console.warn("Gagal memuat pengaturan toko:", err);
  }
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
      (p.deskripsi && p.deskripsi.toLowerCase().includes(searchTerm));
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
      const mediaContent = p.gambar_url
        ? `<img src="${p.gambar_url}" alt="${p.nama}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`
        : (p.emoji || "🛍️");
      return `
      <article class="product-card" data-id="${p.id}">
        <div class="product-media">
          ${mediaContent}
          ${p.unggulan ? '<span class="badge-fav">Favorit</span>' : ""}
          ${outOfStock ? '<span class="badge-out">Habis</span>' : ""}
        </div>
        <div class="product-name">${p.nama}</div>
        <div class="product-unit">${p.satuan}${lowStock ? ` · <span class="stock-low">Sisa ${p.stok}</span>` : ""}</div>
        <div class="price-tag">
          <span class="price">${formatYen(p.harga)}</span>
          <button class="add-btn" data-quickadd="${p.id}" aria-label="Tambah cepat" ${outOfStock ? "disabled style='opacity:.4'" : ""}>+</button>
        </div>
      </article>`;
    })
    .join("");

  grid.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("[data-quickadd]")) return;
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

  const mediaEl = document.getElementById("detailMedia");
  if (p.gambar_url) {
    mediaEl.innerHTML = `<img src="${p.gambar_url}" alt="${p.nama}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
  } else {
    mediaEl.textContent = p.emoji || "🛍️";
  }
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
        const media = p.gambar_url
          ? `<img src="${p.gambar_url}" alt="${p.nama}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;">`
          : `<div class="mini-media">${p.emoji || "🛍️"}</div>`;
        return `
        <div class="cart-item" data-id="${id}">
          ${media}
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

// Generate nomor pesanan: WN-YYYYMMDD-XXXX
function generateOrderNumber() {
  const d = new Date();
  const date = d.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `WN-${date}-${rand}`;
}

function buildCartItemsSnapshot() {
  return Object.entries(cart).map(([id, qty]) => {
    const p = findProduct(id);
    return {
      id,
      nama: p ? p.nama : id,
      harga: p ? p.harga : 0,
      satuan: p ? p.satuan : "",
      qty,
      subtotal: p ? p.harga * qty : 0,
    };
  });
}

function buildCheckoutMessage(orderNumber) {
  const lines = [`Halo Admin ${CONFIG.STORE_NAME}! 🛒 Saya mau pesan:`, ""];
  Object.entries(cart).forEach(([id, qty]) => {
    const p = findProduct(id);
    if (!p) return;
    lines.push(`- ${p.nama} (${qty}x ${p.satuan}) = ${formatYen(p.harga * qty)}`);
  });
  lines.push(
    "",
    `Subtotal: ${formatYen(cartTotal())}`,
    `No. Pesanan: ${orderNumber}`,
    "",
    "Mohon info ongkir & nomor rekening untuk pembayaran. Terima kasih! 🙏"
  );
  return lines.join("\n");
}

/* =====================================================
   8. CHECKOUT — simpan ke database lalu buka WhatsApp
   ===================================================== */
async function handleCheckout() {
  if (cartCount() === 0) {
    showToast("Keranjang masih kosong");
    return;
  }

  const btn = document.getElementById("btnCheckout");
  btn.disabled = true;
  btn.textContent = "Memproses...";

  const orderNumber = generateOrderNumber();
  const items = buildCartItemsSnapshot();

  // Simpan pesanan ke Supabase jika sudah dikonfigurasi
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      const { error } = await sb.from("orders").insert({
        order_number: orderNumber,
        nama_pembeli: "—", // akan diupdate admin setelah konfirmasi WhatsApp
        whatsapp: "—",
        items: items,
        subtotal: cartTotal(),
        status: "menunggu_konfirmasi",
      });
      if (error) throw error;
      console.log("✅ Pesanan tersimpan ke database:", orderNumber);
    } catch (err) {
      console.error("Gagal menyimpan pesanan ke database:", err);
      // Tetap lanjut buka WhatsApp walau gagal simpan ke DB
    }
  }

  // Buka WhatsApp admin
  window.open(waLink(CONFIG.ADMIN_WHATSAPP, buildCheckoutMessage(orderNumber)), "_blank");

  // Tunjukkan info nomor pesanan & link konfirmasi bayar
  closeCart();
  showOrderConfirmModal(orderNumber);

  btn.disabled = false;
  btn.textContent = "Checkout via WhatsApp";
}

function showOrderConfirmModal(orderNumber) {
  const modal = document.getElementById("orderConfirmModal");
  document.getElementById("orderConfirmNumber").textContent = orderNumber;
  // Link ke halaman konfirmasi pembayaran dengan nomor pesanan
  const payLink = document.getElementById("orderConfirmPayLink");
  payLink.href = `konfirmasi-bayar.html?order=${encodeURIComponent(orderNumber)}`;
  modal.classList.add("open");
}

/* =====================================================
   9. FORM REQUEST BARANG KHUSUS
   ===================================================== */
async function handleRequestSubmit(e) {
  e.preventDefault();
  const nama = document.getElementById("reqNama").value.trim();
  const kontak = document.getElementById("reqKontak").value.trim();
  const barang = document.getElementById("reqBarang").value.trim();
  const jumlah = document.getElementById("reqJumlah").value.trim();
  const catatan = document.getElementById("reqCatatan").value.trim();

  const btn = e.target.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.textContent = "Mengirim...";

  // Simpan request ke Supabase jika sudah dikonfigurasi
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      const { error } = await sb.from("product_requests").insert({ nama, kontak, barang, jumlah, catatan });
      if (error) throw error;
      console.log("✅ Request barang tersimpan ke database");
    } catch (err) {
      console.error("Gagal menyimpan request ke database:", err);
    }
  }

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
  showToast("Permintaan berhasil dikirim ke WhatsApp admin ✅", "success");
  e.target.reset();

  btn.disabled = false;
  btn.textContent = "Kirim Permintaan ke Admin";
}

/* =====================================================
   10. FAQ ACCORDION
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
   11. CHATBOT SEDERHANA (rule-based, tanpa server)
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
      link.style.cssText = "display:block;text-align:center;text-decoration:none;margin-top:4px;";
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
   12. INISIALISASI & EVENT LISTENERS
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
  document.getElementById("btnCheckout").addEventListener("click", handleCheckout);

  // Order confirm modal
  document.getElementById("orderConfirmClose").addEventListener("click", () => {
    document.getElementById("orderConfirmModal").classList.remove("open");
    cart = {};
    saveCart();
    updateCartBadge();
  });
  document.getElementById("orderConfirmModal").addEventListener("click", (e) => {
    if (e.target.id === "orderConfirmModal") {
      document.getElementById("orderConfirmModal").classList.remove("open");
    }
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

  // Bottom nav
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.target);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
});
