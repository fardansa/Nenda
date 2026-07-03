"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, Plus, Edit2, Trash2, X, Info, HelpCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function ManagePackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  // Form State
  const [formNamaPaket, setFormNamaPaket] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formFasilitas, setFormFasilitas] = useState("");
  const [formKapasitas, setFormKapasitas] = useState(1);
  const [formHarga, setFormHarga] = useState(0);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:6969/api/admin/packages", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages);
      } else {
        console.error("Gagal menarik data paket");
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleOpenAddModal = () => {
    setModalType("add");
    setFormNamaPaket("");
    setFormDeskripsi("");
    setFormFasilitas("");
    setFormKapasitas(1);
    setFormHarga(0);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg: any) => {
    setModalType("edit");
    setSelectedPackage(pkg);
    setFormNamaPaket(pkg.nama_paket);
    setFormDeskripsi(pkg.deskripsi);
    setFormFasilitas(pkg.fasilitas);
    setFormKapasitas(pkg.kapasitas);
    setFormHarga(pkg.harga);
    setIsModalOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaPaket || !formDeskripsi || !formFasilitas || formHarga <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Form belum lengkap",
        text: "Harap isi semua field dengan benar",
        confirmButtonColor: "#10b981"
      });
      return;
    }

    const payload = {
      nama_paket: formNamaPaket,
      deskripsi: formDeskripsi,
      fasilitas: formFasilitas,
      kapasitas: formKapasitas,
      harga: formHarga,
    };

    try {
      let url = "http://localhost:6969/api/admin/packages";
      let method = "POST";

      if (modalType === "edit") {
        url = `http://localhost:6969/api/admin/packages/${selectedPackage.paket_id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (res.ok) {
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Data berhasil disimpan",
            timer: 1200,
            showConfirmButton: false,
          });

          setTimeout(() => {
            setIsModalOpen(false);
            fetchPackages();
          }, 300);
        } else {
        const errorData = await res.json();
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan",
          text: errorData.detail || "Terjadi kesalahan saat menyimpan data",
        });
      }
    } catch (err) {
      console.error("Error saving package:", err);
    }
  };

  const handleDeletePackage = async (paketId: number) => {
  const result = await Swal.fire({
    title: "Hapus Paket?",
    text: "Data yang dihapus tidak bisa dikembalikan",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#a8a29e",
  });

  if (!result.isConfirmed) return;

  Swal.fire({
    title: "Menghapus...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const res = await fetch(`http://localhost:6969/api/admin/packages/${paketId}`, {
      method: "DELETE",
      credentials: "include",
    });

    Swal.close();

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Paket berhasil dihapus",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchPackages();
    } else {
      const errorData = await res.json();

      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text: errorData.detail || "Paket mungkin masih digunakan",
      });
    }
  } catch (err) {
    Swal.close();

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Terjadi kesalahan sistem",
    });
  }
};

  const filteredPackages = packages.filter((pkg) =>
    pkg.nama_paket.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Manajemen Paket Camping</h1>
          <p className="text-stone-500 text-sm mt-1">Kelola jenis paket camping, fasilitas, deskripsi layanan, kapasitas tenda, dan harga sewa.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Tambah Paket Baru
          </button>
          <button
            onClick={fetchPackages}
            className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Main Grid Filters */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Cari nama paket atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition bg-stone-50"
            />
            <Search size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto border border-stone-100 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Nama Paket</th>
                <th className="px-6 py-4">Kapasitas</th>
                <th className="px-6 py-4">Harga / Malam</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4">Fasilitas</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="animate-spin text-emerald-500 mb-3" size={32} />
                      <p className="font-medium">Memuat data paket...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <tr key={pkg.paket_id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-stone-900">{pkg.nama_paket}</td>
                    <td className="px-6 py-4 font-semibold text-stone-600">{pkg.kapasitas} Orang</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{formatRupiah(pkg.harga)}</td>
                    <td className="px-6 py-4 text-stone-500 max-w-xs truncate">{pkg.deskripsi}</td>
                    <td className="px-6 py-4 text-stone-500 max-w-xs">
                      <div className="max-h-20 overflow-y-auto pr-2 text-xs font-mono whitespace-pre-line leading-relaxed scrollbar-thin scrollbar-thumb-stone-200">
                        {pkg.fasilitas}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(pkg)}
                          className="p-2 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.paket_id)}
                          className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    <p className="font-medium">Tidak ada data paket yang cocok.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit Paket */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative border">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-600 transition"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-stone-800">
              {modalType === "add" ? "Tambah Paket Camping Baru" : "Edit Paket Camping"}
            </h2>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Nama Paket</label>
                <input
                  type="text"
                  placeholder="Contoh: Single, Double, Deluxe Family"
                  value={formNamaPaket}
                  onChange={(e) => setFormNamaPaket(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-stone-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Kapasitas (Orang)</label>
                  <input
                    type="number"
                    min="1"
                    value={formKapasitas}
                    onChange={(e) => setFormKapasitas(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-stone-900 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Harga per Malam</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 250000"
                    value={formHarga}
                    onChange={(e) => setFormHarga(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-stone-900 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Deskripsi Singkat</label>
                <textarea
                  placeholder="Masukkan penjelasan singkat tentang paket..."
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-stone-900 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  Fasilitas <HelpCircle size={14} className="text-stone-400" title="Gunakan tanda bullet (•) di awal baris" />
                </label>
                <textarea
                  placeholder="• 1 Sleeping Pad&#10;• 1 Sleeping Bag&#10;• Lampu LED"
                  value={formFasilitas}
                  onChange={(e) => setFormFasilitas(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-stone-900"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md transition cursor-pointer"
                >
                  Simpan Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
