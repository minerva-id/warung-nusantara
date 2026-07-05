/* =========================================================
   WARUNG NUSANTARA — KONFIRMASI BAYAR JS
   
   Halaman konfirmasi pembayaran untuk customer:
   - Isi nomor pesanan, nama pengirim, bank asal, jumlah transfer
   - Upload foto bukti transfer (ke Supabase Storage)
   - Simpan konfirmasi ke database
   - Fallback: buka WhatsApp jika Supabase belum dikonfigurasi
   ========================================================= */

const CONFIG_PAY = {
  ADMIN_WHATSAPP: "6281234567890", // akan diambil dari Supabase settings
  STORE_NAME: "Warung Nusantara",
};

const PAYMENT_METHODS = [
  { id: "transfer-bca", label: "Transfer Bank BCA", icon: "🏦" },
  { id: "transfer-bri", label: "Transfer Bank BRI", icon: "🏦" },
  { id: "transfer-mandiri", label: "Transfer Bank Mandiri", icon: "🏦" },
  { id: "transfer-bni", label: "Transfer Bank BNI", icon: "🏦" },
  { id: "qris", label: "QRIS", icon: "📱" },
  { id: "ovo", label: "OVO", icon: "💜" },
  { id: "gopay", label: "GoPay", icon: "💚" },
  { id: "dana", label: "DANA", icon: "💙" },
];

let storeSettings = {};
let uploadedFileUrl = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Ambil nomor pesanan dari URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const orderNumber = urlParams.get("order") || "";
  if (orderNumber) {
    document.getElementById("payOrderNumber").value = orderNumber;
  }

  // Render metode pembayaran
  renderPaymentMethods();

  // Muat pengaturan toko (nomor rekening dll.)
  await loadSettings();

  // Form submit
  document.getElementById("payConfirmForm").addEventListener("submit", handlePayConfirmSubmit);

  // Preview foto
  document.getElementById("payBuktiFile").addEventListener("change", handleFilePreview);

  // Toggle metode bayar
  document.querySelectorAll(".pay-method-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pay-method-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("payMetodeBayar").value = btn.dataset.method;
      updateBankInfo(btn.dataset.method);
    });
  });
});

async function loadSettings() {
  if (!isSupabaseConfigured()) return;
  try {
    const sb = getSupabase();
    const { data } = await sb.from("store_settings").select("key,value");
    if (data) {
      storeSettings = Object.fromEntries(data.map((r) => [r.key, r.value]));
      if (storeSettings.whatsapp_admin) CONFIG_PAY.ADMIN_WHATSAPP = storeSettings.whatsapp_admin;
      updateBankInfo("transfer-bca"); // default tampilkan BCA
    }
  } catch (err) {
    console.warn("Gagal memuat pengaturan toko:", err);
  }
}

function renderPaymentMethods() {
  const wrap = document.getElementById("payMethodsList");
  wrap.innerHTML = PAYMENT_METHODS.map((m) => `
    <button class="pay-method-btn ${m.id === "transfer-bca" ? "active" : ""}" data-method="${m.id}" type="button">
      <span>${m.icon}</span>
      <span>${m.label}</span>
    </button>
  `).join("");
  document.getElementById("payMetodeBayar").value = "transfer-bca";
}

function updateBankInfo(methodId) {
  const infoEl = document.getElementById("bankInfoBox");
  if (!infoEl) return;

  let html = "";
  if (methodId === "transfer-bca") {
    const nama = storeSettings.bank_bca_atas_nama || "—";
    const norek = storeSettings.bank_bca_nomor || "—";
    html = `<div class="bank-info-card">
      <div class="bank-logo">🏦</div>
      <div>
        <div class="bank-name">Bank BCA</div>
        <div class="bank-norek">${norek}</div>
        <div class="bank-atname">a.n. ${nama}</div>
      </div>
      <button type="button" class="copy-btn" onclick="copyText('${norek}')">Salin</button>
    </div>`;
  } else if (methodId === "transfer-bri") {
    const nama = storeSettings.bank_bri_atas_nama || "—";
    const norek = storeSettings.bank_bri_nomor || "—";
    html = norek !== "—" ? `<div class="bank-info-card">
      <div class="bank-logo">🏦</div>
      <div>
        <div class="bank-name">Bank BRI</div>
        <div class="bank-norek">${norek}</div>
        <div class="bank-atname">a.n. ${nama}</div>
      </div>
      <button type="button" class="copy-btn" onclick="copyText('${norek}')">Salin</button>
    </div>` : `<p style="color:var(--muted);font-size:13px;">Rekening BRI belum dikonfigurasi admin. Pilih metode lain atau hubungi admin.</p>`;
  } else if (methodId === "transfer-mandiri") {
    const nama = storeSettings.bank_mandiri_atas_nama || "—";
    const norek = storeSettings.bank_mandiri_nomor || "—";
    html = norek !== "—" ? `<div class="bank-info-card">
      <div class="bank-logo">🏦</div>
      <div>
        <div class="bank-name">Bank Mandiri</div>
        <div class="bank-norek">${norek}</div>
        <div class="bank-atname">a.n. ${nama}</div>
      </div>
      <button type="button" class="copy-btn" onclick="copyText('${norek}')">Salin</button>
    </div>` : `<p style="color:var(--muted);font-size:13px;">Rekening Mandiri belum dikonfigurasi. Hubungi admin.</p>`;
  } else if (methodId === "qris") {
    html = `<div class="bank-info-card" style="flex-direction:column;text-align:center;">
      <div style="font-size:40px;">📲</div>
      <div class="bank-name">QRIS Universal</div>
      <p style="font-size:12px;color:var(--muted);">QR Code dikirim admin via WhatsApp setelah pesanan dikonfirmasi.</p>
    </div>`;
  } else {
    html = `<p style="color:var(--muted);font-size:13px;">Metode ini dikonfirmasi langsung via WhatsApp dengan admin.</p>`;
  }

  infoEl.innerHTML = html;
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showPayToast("Nomor rekening disalin! ✓");
  });
}

function handleFilePreview(e) {
  const file = e.target.files[0];
  if (!file) return;
  const previewWrap = document.getElementById("filePreviewWrap");
  const img = document.getElementById("filePreviewImg");
  const reader = new FileReader();
  reader.onload = (ev) => {
    img.src = ev.target.result;
    previewWrap.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
}

async function handlePayConfirmSubmit(e) {
  e.preventDefault();

  const orderNumber = document.getElementById("payOrderNumber").value.trim();
  const namaPengirim = document.getElementById("payNamaPengirim").value.trim();
  const metodeBayar = document.getElementById("payMetodeBayar").value;
  const jumlahTransfer = Number(document.getElementById("payJumlahTransfer").value.replace(/\D/g, ""));
  const tanggalTransfer = document.getElementById("payTanggal").value;
  const catatan = document.getElementById("payCatatan").value.trim();
  const fileInput = document.getElementById("payBuktiFile");

  const btn = e.target.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.textContent = "Mengirim...";

  // Validasi dasar
  if (!orderNumber || !namaPengirim || !metodeBayar || !jumlahTransfer || !tanggalTransfer) {
    showPayToast("Semua kolom wajib diisi.", "error");
    btn.disabled = false;
    btn.textContent = "Kirim Konfirmasi Pembayaran";
    return;
  }

  let buktiUrl = null;

  // Upload foto bukti ke Supabase Storage (jika ada foto dan Supabase dikonfigurasi)
  if (fileInput.files[0] && isSupabaseConfigured()) {
    try {
      const file = fileInput.files[0];
      const fileName = `${orderNumber}-${Date.now()}.${file.name.split(".").pop()}`;
      const sb = getSupabase();
      const { data: uploadData, error: uploadError } = await sb.storage
        .from("bukti-bayar")
        .upload(fileName, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      // Simpan path, bukan signed URL (admin bisa generate signed URL dari dashboard)
      buktiUrl = uploadData.path;
      console.log("✅ Bukti pembayaran terupload:", buktiUrl);
    } catch (err) {
      console.error("Gagal upload bukti:", err);
      // Lanjut tanpa foto
    }
  }

  // Simpan ke Supabase jika sudah dikonfigurasi
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();

      // Cari order_id dari order_number
      const { data: order } = await sb
        .from("orders")
        .select("id")
        .eq("order_number", orderNumber)
        .single();

      const { error } = await sb.from("payment_confirmations").insert({
        order_id: order?.id || null,
        order_number: orderNumber,
        nama_pengirim: namaPengirim,
        jumlah_transfer: jumlahTransfer,
        bank_asal: metodeBayar,
        tanggal_transfer: tanggalTransfer,
        bukti_url: buktiUrl,
        catatan: catatan,
        status: "menunggu_verifikasi",
      });

      if (error) throw error;

      // Update status pesanan menjadi "bukti_diterima"
      if (order?.id) {
        await sb.from("orders").update({ status: "bukti_diterima" }).eq("id", order.id);
      }

      showSuccessScreen(orderNumber);
    } catch (err) {
      console.error("Gagal menyimpan konfirmasi:", err);
      // Fallback ke WhatsApp
      sendViaWhatsApp(orderNumber, namaPengirim, metodeBayar, jumlahTransfer, tanggalTransfer, catatan);
    }
  } else {
    // Fallback: kirim via WhatsApp
    sendViaWhatsApp(orderNumber, namaPengirim, metodeBayar, jumlahTransfer, tanggalTransfer, catatan);
  }

  btn.disabled = false;
  btn.textContent = "Kirim Konfirmasi Pembayaran";
}

function sendViaWhatsApp(orderNumber, namaPengirim, metodeBayar, jumlahTransfer, tanggalTransfer, catatan) {
  const text = [
    `✅ Konfirmasi Pembayaran — ${CONFIG_PAY.STORE_NAME}`,
    "",
    `No. Pesanan: ${orderNumber}`,
    `Nama Pengirim: ${namaPengirim}`,
    `Metode Bayar: ${metodeBayar.replace(/-/g, " ")}`,
    `Jumlah Transfer: Rp ${jumlahTransfer.toLocaleString("id-ID")}`,
    `Tanggal Transfer: ${tanggalTransfer}`,
    catatan ? `Catatan: ${catatan}` : null,
    "",
    "Mohon dikonfirmasi. Terima kasih! 🙏",
  ].filter(Boolean).join("\n");

  window.open(`https://wa.me/${CONFIG_PAY.ADMIN_WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
  showSuccessScreen(orderNumber);
}

function showSuccessScreen(orderNumber) {
  document.getElementById("payFormSection").classList.add("hidden");
  document.getElementById("paySuccessSection").classList.remove("hidden");
  document.getElementById("successOrderNumber").textContent = orderNumber;
}

function showPayToast(msg, type = "default") {
  const toast = document.getElementById("payToast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  clearTimeout(showPayToast._t);
  showPayToast._t = setTimeout(() => toast.classList.remove("show"), 2800);
}
