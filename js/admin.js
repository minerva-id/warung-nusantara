/* =========================================================
   WARUNG NUSANTARA — ADMIN.JS
   Alat bantu client-side untuk menyunting data/products.json.
   TIDAK ADA server/database: hasil akhirnya adalah file JSON
   yang diunduh, lalu admin unggah manual ke repository GitHub.
   ========================================================= */

// Ganti kata sandi ini sesuka Anda. INI BUKAN keamanan sungguhan
// (siapa pun yang membuka kode sumber bisa membacanya) — lihat
// DOCUMENTATION.md bagian "Batasan Teknis" untuk rekomendasi produksi.
const ADMIN_PASSWORD = "nusantara2026";

let products = [];

/* ---------- Gerbang kata sandi ---------- */
document.getElementById("btnUnlock").addEventListener("click", tryUnlock);
document.getElementById("lockPassword").addEventListener("keydown", (e) => {
  if (e.key === "Enter") tryUnlock();
});
function tryUnlock() {
  const val = document.getElementById("lockPassword").value;
  if (val === ADMIN_PASSWORD) {
    document.getElementById("lockScreen").classList.add("hidden");
    document.getElementById("adminStage").classList.remove("hidden");
  } else {
    document.getElementById("lockPassword").style.borderColor = "var(--primary)";
    document.getElementById("lockPassword").value = "";
    document.getElementById("lockPassword").placeholder = "Kata sandi salah, coba lagi";
  }
}

/* ---------- Memuat data ---------- */
document.getElementById("btnLoadDefault").addEventListener("click", async () => {
  try {
    const res = await fetch("data/products.json");
    products = await res.json();
    renderTable();
    setStatus(`Berhasil memuat ${products.length} produk dari data/products.json`);
  } catch (err) {
    setStatus("Gagal memuat otomatis. Jika Anda membuka file ini langsung (bukan lewat server), gunakan tombol 'Impor File JSON'.", true);
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
      setStatus(`Berhasil mengimpor ${products.length} produk dari file "${file.name}"`);
    } catch (err) {
      setStatus("File JSON tidak valid.", true);
    }
  };
  reader.readAsText(file);
});

function setStatus(msg, isError) {
  const el = document.getElementById("loadStatus");
  el.textContent = msg;
  el.style.color = isError ? "var(--primary)" : "var(--accent-green-d)";
}

/* ---------- Tabel produk (edit langsung) ---------- */
function renderTable() {
  const tbody = document.getElementById("productTableBody");
  tbody.innerHTML = products
    .map(
      (p, i) => `
    <tr data-i="${i}">
      <td><input type="text" data-field="nama" value="${escapeAttr(p.nama)}"></td>
      <td>
        <select data-field="kategori">
          ${["mie-instan", "bumbu-dapur", "sembako", "snack", "minuman", "bahan-segar"]
            .map((c) => `<option value="${c}" ${p.kategori === c ? "selected" : ""}>${c}</option>`)
            .join("")}
        </select>
      </td>
      <td><input type="number" data-field="harga" value="${p.harga}" min="0"></td>
      <td><input type="text" data-field="satuan" value="${escapeAttr(p.satuan)}"></td>
      <td><input type="number" data-field="stok" value="${p.stok}" min="0"></td>
      <td><input type="text" data-field="emoji" value="${escapeAttr(p.emoji || "")}" style="text-align:center;"></td>
      <td><button class="row-delete" data-del="${i}">Hapus</button></td>
    </tr>`
    )
    .join("");

  tbody.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", (e) => {
      const row = e.target.closest("tr");
      const i = Number(row.dataset.i);
      const field = e.target.dataset.field;
      let val = e.target.value;
      if (field === "harga" || field === "stok") val = Number(val) || 0;
      products[i][field] = val;
    });
  });
  tbody.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.del);
      if (confirm(`Hapus produk "${products[i].nama}"?`)) {
        products.splice(i, 1);
        renderTable();
      }
    });
  });
}
function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

/* ---------- Tambah produk baru ---------- */
document.getElementById("addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const nama = document.getElementById("fNama").value.trim();
  const kategori = document.getElementById("fKategori").value;
  const harga = Number(document.getElementById("fHarga").value) || 0;
  const satuan = document.getElementById("fSatuan").value.trim();
  const stok = Number(document.getElementById("fStok").value) || 0;
  const emoji = document.getElementById("fEmoji").value.trim() || "🛍️";
  const deskripsi = document.getElementById("fDeskripsi").value.trim();
  const tag = document
    .getElementById("fTag")
    .value.split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const unggulan = document.getElementById("fUnggulan").checked;

  const id = slugify(nama) + "-" + Math.random().toString(36).slice(2, 6);

  products.push({ id, kategori, nama, deskripsi, harga, satuan, stok, tag, emoji, unggulan });
  renderTable();
  e.target.reset();
  setStatus(`Produk "${nama}" ditambahkan ke tabel. Jangan lupa unduh file di langkah 4.`);
});
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ---------- Unduh JSON ---------- */
document.getElementById("btnDownload").addEventListener("click", () => {
  if (products.length === 0) {
    setStatus("Belum ada data untuk diunduh. Muat data terlebih dahulu.", true);
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
  setStatus("File products.json berhasil diunduh. Ganti file lama di folder data/ pada repository Anda.");
});
