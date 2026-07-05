/* =========================================================
   WARUNG NUSANTARA — ADMIN.JS (Versi Supabase)
   
   Perubahan dari versi statis:
   - Login menggunakan Supabase Auth (email + password, JWT)
   - Produk dibaca/tulis langsung ke database Supabase
   - Dapat melihat & kelola pesanan (orders)
   - Dapat melihat & verifikasi konfirmasi pembayaran
   - Dapat melihat request barang khusus
   - Dapat mengelola pengaturan toko (nomor rekening, dll.)
   
   FALLBACK: jika Supabase belum dikonfigurasi, mode file JSON
   lama tetap berfungsi
   ========================================================= */

/* =====================================================
   STATE
   ===================================================== */
let products = [];
let currentTab = "products";

/* =====================================================
   INIT — cek apakah Supabase sudah dikonfigurasi
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  if (isSupabaseConfigured()) {
    // Mode Supabase: tampilkan login email/password
    document.getElementById("lockScreen").classList.add("hidden");
    document.getElementById("supabaseLockScreen").classList.remove("hidden");
    initSupabaseAuth();
  } else {
    // Mode fallback: tampilkan gerbang password lama
    document.getElementById("lockScreen").classList.remove("hidden");
    document.getElementById("supabaseLockScreen").classList.add("hidden");
    initLegacyMode();
  }
});

/* =====================================================
   MODE SUPABASE AUTH
   ===================================================== */
function initSupabaseAuth() {
  const sb = getSupabase();

  // Cek apakah sudah login
  sb.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      showAdminStage(session.user);
    }
  });

  // Login form
  document.getElementById("btnSupabaseLogin").addEventListener("click", handleSupabaseLogin);
  document.getElementById("supabaseEmail").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSupabaseLogin();
  });
  document.getElementById("supabasePassword").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSupabaseLogin();
  });

  // Logout
  document.getElementById("btnLogout").addEventListener("click", async () => {
    await sb.auth.signOut();
    location.reload();
  });
}

async function handleSupabaseLogin() {
  const email = document.getElementById("supabaseEmail").value.trim();
  const password = document.getElementById("supabasePassword").value;
  const errEl = document.getElementById("loginError");
  const btn = document.getElementById("btnSupabaseLogin");

  if (!email || !password) {
    errEl.textContent = "Email dan kata sandi wajib diisi.";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Masuk...";
  errEl.textContent = "";

  const sb = getSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    errEl.textContent = "Email atau kata sandi salah. Coba lagi.";
    btn.disabled = false;
    btn.textContent = "Masuk";
    return;
  }

  showAdminStage(data.user);
}

async function showAdminStage(user) {
  document.getElementById("supabaseLockScreen").classList.add("hidden");
  document.getElementById("lockScreen").classList.add("hidden");
  document.getElementById("adminStage").classList.remove("hidden");
  document.getElementById("adminUserEmail").textContent = user.email;

  initAdminTabs();
  await loadAdminProducts();
}

/* =====================================================
   MODE LEGACY (fallback password, Supabase belum dikonfigurasi)
   ===================================================== */
const ADMIN_PASSWORD = "nusantara2026"; // Ganti ini — BUKAN keamanan sungguhan

function initLegacyMode() {
  document.getElementById("btnUnlock").addEventListener("click", tryUnlock);
  document.getElementById("lockPassword").addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryUnlock();
  });
  document.getElementById("btnLogout").classList.add("hidden");
}

function tryUnlock() {
  const val = document.getElementById("lockPassword").value;
  if (val === ADMIN_PASSWORD) {
    document.getElementById("lockScreen").classList.add("hidden");
    document.getElementById("adminStage").classList.remove("hidden");
    document.getElementById("adminUserEmail").textContent = "Mode Lokal";
    initAdminTabs();
    initLegacyProductTab();
  } else {
    document.getElementById("lockPassword").style.borderColor = "var(--primary)";
    document.getElementById("lockPassword").value = "";
    document.getElementById("lockPassword").placeholder = "Kata sandi salah, coba lagi";
  }
}

/* =====================================================
   TABS NAVIGASI ADMIN
   ===================================================== */
function initAdminTabs() {
  const tabBtns = document.querySelectorAll(".admin-tab-btn");
  const tabPanels = document.querySelectorAll(".admin-tab-panel");

  function activateTab(tabId) {
    currentTab = tabId;
    tabBtns.forEach((b) => b.classList.toggle("active", b.dataset.tab === tabId));
    tabPanels.forEach((p) => p.classList.toggle("hidden", p.id !== `tab-${tabId}`));
    // Lazy load data per tab
    if (tabId === "orders") loadAdminOrders();
    if (tabId === "payments") loadAdminPayments();
    if (tabId === "requests") loadAdminRequests();
    if (tabId === "settings") loadAdminSettings();
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tab));
  });

  // Aktifkan tab pertama
  activateTab("products");
}

/* =====================================================
   TAB: PRODUK
   ===================================================== */
async function loadAdminProducts() {
  setStatus("Memuat produk...", "info");

  if (!isSupabaseConfigured()) {
    initLegacyProductTab();
    return;
  }

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("products")
      .select("*")
      .order("kategori")
      .order("nama");
    if (error) throw error;
    products = data || [];
    renderTable();
    setStatus(`${products.length} produk dimuat dari database.`, "ok");
  } catch (err) {
    setStatus(`Gagal memuat produk: ${err.message}`, "error");
  }
}

function initLegacyProductTab() {
  document.getElementById("btnLoadDefault").addEventListener("click", async () => {
    try {
      const res = await fetch("data/products.json");
      products = await res.json();
      renderTable();
      setStatus(`Berhasil memuat ${products.length} produk dari data/products.json`);
    } catch (err) {
      setStatus("Gagal memuat otomatis. Gunakan tombol 'Impor File JSON'.", "error");
    }
  });

  document.getElementById("btnImportFile").addEventListener("click", () => {
    document.getElementById("fileInput").click();
  });
  document.getElementById("fileInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        products = JSON.parse(ev.target.result);
        renderTable();
        setStatus(`Berhasil mengimpor ${products.length} produk dari "${file.name}"`);
      } catch {
        setStatus("File JSON tidak valid.", "error");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("legacyLoadSection").classList.remove("hidden");
  document.getElementById("btnDownload").addEventListener("click", downloadJson);
}

function renderTable() {
  const tbody = document.getElementById("productTableBody");
  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:24px;">Belum ada produk</td></tr>`;
    return;
  }
  tbody.innerHTML = products
    .map(
      (p, i) => `
    <tr data-i="${i}" class="${p.aktif === false ? 'row-inactive' : ''}">
      <td><input type="text" data-field="nama" value="${escapeAttr(p.nama)}"></td>
      <td>
        <select data-field="kategori">
          ${["mie-instan", "bumbu-dapur", "sembako", "snack", "minuman", "bahan-segar"]
            .map((c) => `<option value="${c}" ${p.kategori === c ? "selected" : ""}>${c}</option>`)
            .join("")}
        </select>
      </td>
      <td><input type="number" data-field="harga" value="${p.harga}" min="0"></td>
      <td><input type="text" data-field="satuan" value="${escapeAttr(p.satuan || "")}"></td>
      <td><input type="number" data-field="stok" value="${p.stok}" min="0"></td>
      <td><input type="text" data-field="emoji" value="${escapeAttr(p.emoji || "")}" style="text-align:center;"></td>
      <td style="text-align:center;">
        <input type="checkbox" data-field="unggulan" ${p.unggulan ? "checked" : ""} style="width:auto;">
      </td>
      <td style="text-align:center;">
        <input type="checkbox" data-field="aktif" ${p.aktif !== false ? "checked" : ""} style="width:auto;">
      </td>
      <td>
        <button class="row-save btn-outline green" data-save="${i}" title="Simpan ke database">💾</button>
        <button class="row-delete" data-del="${i}" title="Hapus produk">🗑</button>
      </td>
    </tr>`
    )
    .join("");

  tbody.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("change", (e) => {
      const row = e.target.closest("tr");
      const i = Number(row.dataset.i);
      const field = e.target.dataset.field;
      let val = input.type === "checkbox" ? input.checked : e.target.value;
      if (field === "harga" || field === "stok") val = Number(val) || 0;
      products[i][field] = val;
    });
  });

  tbody.querySelectorAll("[data-save]").forEach((btn) => {
    btn.addEventListener("click", () => saveProduct(Number(btn.dataset.save)));
  });

  tbody.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.del);
      if (confirm(`Hapus produk "${products[i].nama}"?`)) deleteProduct(i);
    });
  });
}

async function saveProduct(i) {
  const p = products[i];
  if (!isSupabaseConfigured()) {
    setStatus("Mode lokal: gunakan tombol unduh untuk menyimpan.", "info");
    return;
  }

  try {
    const sb = getSupabase();
    const { error } = await sb.from("products").upsert({
      ...p,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    setStatus(`Produk "${p.nama}" berhasil disimpan ke database.`, "ok");
  } catch (err) {
    setStatus(`Gagal menyimpan: ${err.message}`, "error");
  }
}

async function deleteProduct(i) {
  const p = products[i];
  if (!isSupabaseConfigured()) {
    products.splice(i, 1);
    renderTable();
    return;
  }

  try {
    const sb = getSupabase();
    // Soft delete: set aktif = false, jangan hapus dari DB
    const { error } = await sb.from("products").update({ aktif: false }).eq("id", p.id);
    if (error) throw error;
    products.splice(i, 1);
    renderTable();
    setStatus(`Produk "${p.nama}" berhasil dihapus.`, "ok");
  } catch (err) {
    setStatus(`Gagal menghapus: ${err.message}`, "error");
  }
}

// Form tambah produk baru
document.getElementById("addForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nama = document.getElementById("fNama").value.trim();
  const kategori = document.getElementById("fKategori").value;
  const harga = Number(document.getElementById("fHarga").value) || 0;
  const satuan = document.getElementById("fSatuan").value.trim();
  const stok = Number(document.getElementById("fStok").value) || 0;
  const emoji = document.getElementById("fEmoji").value.trim() || "🛍️";
  const deskripsi = document.getElementById("fDeskripsi").value.trim();
  const tag = document.getElementById("fTag").value.split(",").map((t) => t.trim()).filter(Boolean);
  const unggulan = document.getElementById("fUnggulan").checked;

  const id = slugify(nama) + "-" + Math.random().toString(36).slice(2, 6);
  const newProduct = { id, kategori, nama, deskripsi, harga, satuan, stok, tag, emoji, unggulan, aktif: true };

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      const { error } = await sb.from("products").insert(newProduct);
      if (error) throw error;
      products.push(newProduct);
      renderTable();
      e.target.reset();
      setStatus(`Produk "${nama}" berhasil ditambahkan ke database.`, "ok");
    } catch (err) {
      setStatus(`Gagal menambahkan produk: ${err.message}`, "error");
    }
  } else {
    products.push(newProduct);
    renderTable();
    e.target.reset();
    setStatus(`Produk "${nama}" ditambahkan. Unduh file JSON untuk menyimpan.`);
  }
});

function downloadJson() {
  if (products.length === 0) {
    setStatus("Belum ada data untuk diunduh.", "error");
    return;
  }
  const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "products.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  setStatus("File products.json berhasil diunduh.", "ok");
}

document.getElementById("btnDownload").addEventListener("click", downloadJson);

/* =====================================================
   TAB: PESANAN
   ===================================================== */
async function loadAdminOrders() {
  if (!isSupabaseConfigured()) {
    document.getElementById("ordersContent").innerHTML = `<p class="status-msg info">Fitur pesanan membutuhkan Supabase. Konfigurasi js/supabase-config.js terlebih dahulu.</p>`;
    return;
  }

  document.getElementById("ordersContent").innerHTML = `<p class="status-msg info">Memuat pesanan...</p>`;

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    renderOrdersTable(data || []);
  } catch (err) {
    document.getElementById("ordersContent").innerHTML = `<p class="status-msg error">Gagal memuat pesanan: ${err.message}</p>`;
  }
}

function renderOrdersTable(orders) {
  if (orders.length === 0) {
    document.getElementById("ordersContent").innerHTML = `<p class="status-msg info">Belum ada pesanan.</p>`;
    return;
  }

  const statusColors = {
    menunggu_konfirmasi: "#f59e0b",
    dikonfirmasi: "#3b82f6",
    menunggu_bayar: "#8b5cf6",
    bukti_diterima: "#06b6d4",
    diproses: "#10b981",
    dikirim: "#6366f1",
    selesai: "#22c55e",
    dibatalkan: "#ef4444",
  };

  document.getElementById("ordersContent").innerHTML = `
    <div class="table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>No. Pesanan</th>
            <th>Nama</th>
            <th>WhatsApp</th>
            <th>Subtotal</th>
            <th>Status</th>
            <th>Waktu</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map((o) => `
            <tr>
              <td><code>${o.order_number}</code></td>
              <td>${o.nama_pembeli || "—"}</td>
              <td>${o.whatsapp || "—"}</td>
              <td>¥${(o.subtotal || 0).toLocaleString()}</td>
              <td>
                <span class="status-badge" style="background:${statusColors[o.status] || "#6b7280"}">
                  ${o.status.replace(/_/g, " ")}
                </span>
              </td>
              <td>${new Date(o.created_at).toLocaleDateString("id-ID", {day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</td>
              <td>
                <select class="order-status-select" data-order-id="${o.id}" style="font-size:11px;padding:4px 6px;">
                  ${["menunggu_konfirmasi","dikonfirmasi","menunggu_bayar","bukti_diterima","diproses","dikirim","selesai","dibatalkan"]
                    .map((s) => `<option value="${s}" ${o.status === s ? "selected" : ""}>${s.replace(/_/g," ")}</option>`)
                    .join("")}
                </select>
                <button class="btn-outline green" data-update-order="${o.id}" style="font-size:11px;padding:4px 8px;margin-left:4px;">Simpan</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;

  document.querySelectorAll("[data-update-order]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orderId = btn.dataset.updateOrder;
      const row = btn.closest("tr");
      const newStatus = row.querySelector(".order-status-select").value;
      try {
        const sb = getSupabase();
        const { error } = await sb.from("orders").update({ status: newStatus }).eq("id", orderId);
        if (error) throw error;
        setStatus("Status pesanan diperbarui.", "ok");
        loadAdminOrders();
      } catch (err) {
        setStatus(`Gagal update status: ${err.message}`, "error");
      }
    });
  });
}

/* =====================================================
   TAB: KONFIRMASI PEMBAYARAN
   ===================================================== */
async function loadAdminPayments() {
  if (!isSupabaseConfigured()) {
    document.getElementById("paymentsContent").innerHTML = `<p class="status-msg info">Fitur konfirmasi pembayaran membutuhkan Supabase.</p>`;
    return;
  }

  document.getElementById("paymentsContent").innerHTML = `<p class="status-msg info">Memuat konfirmasi pembayaran...</p>`;

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("payment_confirmations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    renderPaymentsTable(data || []);
  } catch (err) {
    document.getElementById("paymentsContent").innerHTML = `<p class="status-msg error">Gagal memuat data: ${err.message}</p>`;
  }
}

function renderPaymentsTable(payments) {
  if (payments.length === 0) {
    document.getElementById("paymentsContent").innerHTML = `<p class="status-msg info">Belum ada konfirmasi pembayaran.</p>`;
    return;
  }

  document.getElementById("paymentsContent").innerHTML = `
    <div class="table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>No. Pesanan</th>
            <th>Nama Pengirim</th>
            <th>Bank Asal</th>
            <th>Jumlah Transfer</th>
            <th>Tanggal</th>
            <th>Bukti</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${payments.map((p) => `
            <tr>
              <td><code>${p.order_number}</code></td>
              <td>${p.nama_pengirim}</td>
              <td><strong>${p.bank_asal}</strong></td>
              <td>Rp ${Number(p.jumlah_transfer).toLocaleString("id-ID")}</td>
              <td>${new Date(p.tanggal_transfer).toLocaleDateString("id-ID")}</td>
              <td>
                ${p.bukti_url
                  ? `<a href="${p.bukti_url}" target="_blank" class="btn-outline" style="font-size:11px;padding:3px 8px;">📷 Lihat</a>`
                  : "<span style='color:var(--muted);font-size:11px;'>Tidak ada</span>"}
              </td>
              <td>
                <span class="status-badge" style="background:${p.status === "terverifikasi" ? "#22c55e" : p.status === "ditolak" ? "#ef4444" : "#f59e0b"}">
                  ${p.status.replace(/_/g, " ")}
                </span>
              </td>
              <td>
                <button class="btn-outline green" data-verify="${p.id}" style="font-size:11px;padding:4px 8px;">✓ Verifikasi</button>
                <button class="row-delete" data-reject="${p.id}" style="font-size:11px;padding:4px 8px;">✗ Tolak</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;

  document.querySelectorAll("[data-verify]").forEach((btn) => {
    btn.addEventListener("click", () => updatePaymentStatus(btn.dataset.verify, "terverifikasi"));
  });
  document.querySelectorAll("[data-reject]").forEach((btn) => {
    btn.addEventListener("click", () => updatePaymentStatus(btn.dataset.reject, "ditolak"));
  });
}

async function updatePaymentStatus(id, status) {
  try {
    const sb = getSupabase();
    const { error } = await sb
      .from("payment_confirmations")
      .update({ status, verified_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    setStatus(`Pembayaran berhasil di-${status === "terverifikasi" ? "verifikasi" : "tolak"}.`, "ok");
    loadAdminPayments();
  } catch (err) {
    setStatus(`Gagal update status: ${err.message}`, "error");
  }
}

/* =====================================================
   TAB: REQUEST BARANG KHUSUS
   ===================================================== */
async function loadAdminRequests() {
  if (!isSupabaseConfigured()) {
    document.getElementById("requestsContent").innerHTML = `<p class="status-msg info">Fitur request barang membutuhkan Supabase.</p>`;
    return;
  }

  document.getElementById("requestsContent").innerHTML = `<p class="status-msg info">Memuat request barang...</p>`;

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("product_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    renderRequestsTable(data || []);
  } catch (err) {
    document.getElementById("requestsContent").innerHTML = `<p class="status-msg error">Gagal memuat data: ${err.message}</p>`;
  }
}

function renderRequestsTable(requests) {
  if (requests.length === 0) {
    document.getElementById("requestsContent").innerHTML = `<p class="status-msg info">Belum ada request barang khusus.</p>`;
    return;
  }

  document.getElementById("requestsContent").innerHTML = `
    <div class="table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Kontak</th>
            <th>Barang Dicari</th>
            <th>Jumlah</th>
            <th>Catatan</th>
            <th>Status</th>
            <th>Waktu</th>
          </tr>
        </thead>
        <tbody>
          ${requests.map((r) => `
            <tr>
              <td>${r.nama}</td>
              <td><a href="https://wa.me/${r.kontak.replace(/\D/g,'')}" target="_blank">${r.kontak}</a></td>
              <td><strong>${r.barang}</strong></td>
              <td>${r.jumlah || "—"}</td>
              <td>${r.catatan || "—"}</td>
              <td>
                <select class="request-status-select" data-req-id="${r.id}" style="font-size:11px;padding:4px 6px;">
                  ${["baru","diproses","tersedia","tidak_tersedia"]
                    .map((s) => `<option value="${s}" ${r.status === s ? "selected" : ""}>${s.replace(/_/g," ")}</option>`)
                    .join("")}
                </select>
                <button class="btn-outline green" data-update-req="${r.id}" style="font-size:11px;padding:4px 8px;margin-top:4px;">Simpan</button>
              </td>
              <td>${new Date(r.created_at).toLocaleDateString("id-ID")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;

  document.querySelectorAll("[data-update-req]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const reqId = btn.dataset.updateReq;
      const row = btn.closest("tr");
      const newStatus = row.querySelector(".request-status-select").value;
      try {
        const sb = getSupabase();
        const { error } = await sb.from("product_requests").update({ status: newStatus }).eq("id", reqId);
        if (error) throw error;
        setStatus("Status request diperbarui.", "ok");
        loadAdminRequests();
      } catch (err) {
        setStatus(`Gagal update: ${err.message}`, "error");
      }
    });
  });
}

/* =====================================================
   TAB: PENGATURAN TOKO
   ===================================================== */
async function loadAdminSettings() {
  if (!isSupabaseConfigured()) {
    document.getElementById("settingsContent").innerHTML = `<p class="status-msg info">Fitur pengaturan toko membutuhkan Supabase.</p>`;
    return;
  }

  document.getElementById("settingsContent").innerHTML = `<p class="status-msg info">Memuat pengaturan...</p>`;

  try {
    const sb = getSupabase();
    const { data, error } = await sb.from("store_settings").select("*").order("key");
    if (error) throw error;
    renderSettingsForm(data || []);
  } catch (err) {
    document.getElementById("settingsContent").innerHTML = `<p class="status-msg error">Gagal memuat pengaturan: ${err.message}</p>`;
  }
}

function renderSettingsForm(settings) {
  document.getElementById("settingsContent").innerHTML = `
    <div class="admin-card" style="margin-top:0;">
      <h3 style="margin-bottom:16px;font-size:15px;">Pengaturan Toko</h3>
      <form id="settingsForm" class="grid-form">
        ${settings.map((s) => `
          <div class="field full">
            <label>${s.label || s.key}</label>
            <input type="text" name="${s.key}" value="${escapeAttr(s.value || "")}" placeholder="${s.label || s.key}">
          </div>
        `).join("")}
        <div class="full">
          <button type="submit" class="btn-solid">💾 Simpan Semua Pengaturan</button>
        </div>
      </form>
    </div>`;

  document.getElementById("settingsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updates = Array.from(formData.entries()).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    try {
      const sb = getSupabase();
      const { error } = await sb.from("store_settings").upsert(updates, { onConflict: "key" });
      if (error) throw error;
      setStatus("Pengaturan berhasil disimpan.", "ok");
    } catch (err) {
      setStatus(`Gagal menyimpan pengaturan: ${err.message}`, "error");
    }
  });
}

/* =====================================================
   UTIL
   ===================================================== */
function setStatus(msg, type = "info") {
  const el = document.getElementById("loadStatus");
  el.textContent = msg;
  el.className = `status-line status-${type}`;
}

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
