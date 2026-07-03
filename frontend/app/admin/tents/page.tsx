"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, Check, X, Plus, Edit2, Trash2, Calendar, Info, Clock } from "lucide-react";
import Swal from "sweetalert2";

export default function ManageTentsPage() {
  const [tents, setTents] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [paketFilter, setPaketFilter] = useState("semua");
  
  // Filter Tanggal Ketersediaan
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [selectedTent, setSelectedTent] = useState<any>(null);

  // Form State
  const [formPaketId, setFormPaketId] = useState("");
  const [formNomorTent, setFormNomorTent] = useState("");
  const [formNomorLoker, setFormNomorLoker] = useState("");
  const [formStatus, setFormStatus] = useState("tersedia");

  const fetchData = async () => {
    setLoading(true);
    try {
      const tentsRes = await fetch(`http://localhost:6969/api/admin/tents/availability-by-date?date=${selectedDate}`, {
        credentials: "include",
      });
      if (tentsRes.ok) {
        const tentsData = await tentsRes.json();
        setTents(tentsData.tents);
      }

      const pkgRes = await fetch("http://localhost:6969/api/admin/packages", {
        credentials: "include",
      });
      if (pkgRes.ok) {
        const pkgData = await pkgRes.json();
        setPackages(pkgData.packages);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleOpenAddModal = () => {
    setModalType("add");
    setFormPaketId(packages[0]?.paket_id || "");
    setFormNomorTent("");
    setFormNomorLoker("");
    setFormStatus("tersedia");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tent: any) => {
    setModalType("edit");
    setSelectedTent(tent);
    setFormPaketId(tent.paket_id || packages.find(p => p.nama_paket === tent.nama_paket)?.paket_id || "");
    setFormNomorTent(tent.nomor_tent);
    setFormNomorLoker(tent.nomor_loker);
    setFormStatus(tent.status_tenda || tent.status || "tersedia");
    setIsModalOpen(true);
  };

  const handleSaveTent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNomorTent || !formNomorLoker || !formPaketId) {
      Swal.fire({
        icon: "warning",
        title: "Form belum lengkap",
        text: "Harap isi semua data tenda dengan benar",
        confirmButtonColor: "#10b981"
      });
      return;
    }

    const payload = {
      paket_id: parseInt(formPaketId),
      nomor_tent: formNomorTent,
      nomor_loker: formNomorLoker,
      status: formStatus,
    };

    try {
      let url = "http://localhost:6969/api/admin/tents";
      let method = "POST";

      if (modalType === "edit") {
        url = `http://localhost:6969/api/admin/tents/${selectedTent.tent_id}`;
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
          title: modalType === "add" ? "Tenda Ditambahkan" : "Tenda Diperbarui",
          text: "Data tenda berhasil disimpan",
          timer: 1500,
          showConfirmButton: false,
        });

        setIsModalOpen(false);
        fetchData();
      } else {
        const errorData = await res.json();

        Swal.fire({
          icon: "error",
          title: "Gagal Menyimpan",
          text: errorData.detail || "Terjadi kesalahan saat menyimpan tenda",
        });
      }
    } catch (err) {
      console.error("Error saving tent:", err);
    }
  };

  const handleDeleteTent = async (tentId: number) => {
    const result = await Swal.fire({
      title: "Hapus Unit Tenda?",
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
      const res = await fetch(`http://localhost:6969/api/admin/tents/${tentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      Swal.close();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Unit tenda berhasil dihapus",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchData();
      } else {
        const errorData = await res.json();

        Swal.fire({
          icon: "error",
          title: "Gagal Menghapus",
          text: errorData.detail || "Tenda masih digunakan dalam transaksi",
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


  const filteredTents = tents.filter((tent) => {
    const matchesSearch =
      tent.nomor_tent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tent.nama_paket.toLowerCase().includes(searchQuery.toLowerCase());

    // Tentukan status ketersediaan real-time pada tanggal terpilih
    const isBooked = !!tent.pemesanan_id;
    const currentStatus = isBooked ? "booking" : tent.status_tenda || tent.status;

    const matchesFilter =
      statusFilter === "semua" ||
      (statusFilter === "booking" && isBooked) ||
      (statusFilter === "tersedia" && !isBooked && currentStatus === "tersedia") ||
      (statusFilter === "tidak tersedia" && !isBooked && currentStatus === "tidak tersedia");

    const matchesPaket =
      paketFilter === "semua" ||
      tent.nama_paket.toLowerCase() === paketFilter.toLowerCase();

    return matchesSearch && matchesFilter && matchesPaket;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Manajemen Unit Tenda</h1>
          <p className="text-stone-500 text-sm mt-1">Urus unit tenda, cek ketersediaan tanggal, tambahkan unit baru, dan pantau status pemesanan.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Tambah Unit Tenda
          </button>
          <button
            onClick={fetchData}
            className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Main Grid Filters */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Cek Ketersediaan Tanggal */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-500" /> Lihat Jadwal / Tanggal Booking
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition bg-white font-bold text-stone-900 shadow-inner"
            />
          </div>

          {/* Cari Unit */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Cari Unit Tenda</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nomor tenda atau paket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition bg-white text-stone-900"
              />
              <Search size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
            </div>
          </div>

          {/* Filter Status */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Status Ketersediaan</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition bg-white font-semibold text-stone-900"
            >
              <option value="semua">Semua Status</option>
              <option value="tersedia">Tersedia (Ready)</option>
              <option value="booking">Sedang Dipesan (Booked)</option>
              <option value="tidak tersedia">Tidak Tersedia (Maintanance)</option>
            </select>
          </div>

          {/* Filter Paket */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Filter Jenis Paket</label>
            <select
              value={paketFilter}
              onChange={(e) => setPaketFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition bg-white font-semibold text-stone-900"
            >
              <option value="semua">Semua Paket</option>
              {packages.map((pkg) => (
                <option key={pkg.paket_id} value={pkg.nama_paket}>
                  {pkg.nama_paket.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto border border-stone-100 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Nomor Tenda</th>
                <th className="px-6 py-4">Nomor Loker</th>
                <th className="px-6 py-4">Paket Camping</th>
                <th className="px-6 py-4">Harga / Malam</th>
                <th className="px-6 py-4">Status Tanggal: {selectedDate}</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="animate-spin text-emerald-500 mb-3" size={32} />
                      <p className="font-medium">Memuat data ketersediaan tenda...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTents.length > 0 ? (
                filteredTents.map((tent) => {
                  const isBooked = !!tent.pemesanan_id;
                  return (
                    <tr key={tent.tent_id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-stone-900">{tent.nomor_tent}</td>
                      <td className="px-6 py-4 font-medium text-stone-500">{tent.nomor_loker}</td>
                      <td className="px-6 py-4 font-bold text-stone-800">{tent.nama_paket}</td>
                      <td className="px-6 py-4 font-medium">{formatRupiah(tent.harga)}</td>
                      <td className="px-6 py-4">
                        {isBooked ? (
                          <div className="space-y-1">
                            {tent.status_pemesanan === "telah_dibayar" ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-200">
                                <Check size={12} /> Booked (Lunas)
                              </span>
                            ) : tent.status_pemesanan === "menunggu_konfirmasi" ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200">
                                <Info size={12} /> Booked (Konfirmasi)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 bg-orange-100 text-orange-800 border border-orange-200">
                                <Clock size={12} /> Booked (Belum Bayar)
                              </span>
                            )}
                            <p className="text-xs text-stone-500 font-medium">Penyewa: <span className="font-bold text-stone-800">{tent.user_nama}</span></p>
                          </div>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            (tent.status_tenda || tent.status) === "tersedia" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"
                          }`}>
                            {(tent.status_tenda || tent.status) === "tersedia" ? <Check size={12} /> : <X size={12} />}
                            {(tent.status_tenda || tent.status) === "tersedia" ? "Tersedia" : "Maintenance"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(tent)}
                            className="p-2 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTent(tent.tent_id)}
                            className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    <p className="font-medium">Tidak ada data tenda yang cocok.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit Tenda */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-600 transition"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-stone-800">
              {modalType === "add" ? "Tambah Unit Tenda Baru" : "Edit Unit Tenda"}
            </h2>

            <form onSubmit={handleSaveTent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Pilih Paket Camping</label>
                <select
                  value={formPaketId}
                  onChange={(e) => setFormPaketId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-stone-900 font-semibold"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.paket_id} value={pkg.paket_id}>
                      {pkg.nama_paket} - {formatRupiah(pkg.harga)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Nomor Tenda</label>
                <input
                  type="text"
                  placeholder="Contoh: S11, D11, F21"
                  value={formNomorTent}
                  onChange={(e) => setFormNomorTent(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-stone-900 font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Nomor Loker</label>
                <input
                  type="text"
                  placeholder="Contoh: LS11, LD11, LF21"
                  value={formNomorLoker}
                  onChange={(e) => setFormNomorLoker(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-stone-900 font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Status Default</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-stone-900 font-semibold"
                >
                  <option value="tersedia">Tersedia (Ready)</option>
                  <option value="tidak tersedia">Tidak Tersedia (Maintenance)</option>
                </select>
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
                  Simpan Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}