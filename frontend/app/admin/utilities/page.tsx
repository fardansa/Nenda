"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, Receipt, AlertCircle, RefreshCw } from 'lucide-react';

export default function UtilitiesPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Menunggu Validasi');
  const [loading, setLoading] = useState(true);

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:6969/api/admin/bookings', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.bookings.map((b: any) => {
          let uiStatus = "Belum Bayar";
          if (b.status_pemesanan === 'menunggu_konfirmasi') {
            uiStatus = "Menunggu Validasi";
          } else if (b.status_pemesanan === 'telah_dibayar') {
            uiStatus = "Dikonfirmasi";
          } else if (b.status_pemesanan === 'dibatalkan') {
            uiStatus = "Dibatalkan";
          }
          
          return {
            id: b.pemesanan_id,
            user: b.user_nama,
            paket: `${b.nama_paket.toUpperCase()} TENT (Posisi: ${b.nomor_tent})`,
            nominal: formatRupiah(b.total_harga),
            metode: "Transfer Bank",
            tanggal: b.tanggal_pembayaran ? new Date(b.tanggal_pembayaran).toLocaleString('id-ID') : new Date(b.created_at).toLocaleString('id-ID'),
            status: uiStatus,
            bukti_tf: b.bukti_tf
          };
        });
        setPayments(mapped);
      }
    } catch (err) {
      console.error("Gagal memuat pembayaran admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleConfirm = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:6969/api/admin/bookings/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'telah_dibayar' }),
        credentials: 'include'
      });
      if (res.ok) {
        alert("Pembayaran berhasil dikonfirmasi!");
        fetchPayments();
      } else {
        alert("Gagal mengonfirmasi pembayaran.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:6969/api/admin/bookings/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dibatalkan' }),
        credentials: 'include'
      });
      if (res.ok) {
        alert("Pembayaran berhasil ditolak!");
        fetchPayments();
      } else {
        alert("Gagal menolak pembayaran.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async (id: number) => {
    const confirmCancel = window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini secara manual?");
    if (!confirmCancel) return;
    
    try {
      const res = await fetch(`http://localhost:6969/api/admin/bookings/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dibatalkan' }),
        credentials: 'include'
      });
      if (res.ok) {
        alert("Pesanan berhasil dibatalkan secara manual!");
        fetchPayments();
      } else {
        alert("Gagal membatalkan pesanan.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPayments = payments.filter(p => p.status === activeTab);

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Validasi Pembayaran</h1>
          <p className="text-stone-500 text-sm mt-1">Utilitas untuk memeriksa bukti transfer dan mengonfirmasi reservasi tenda.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex bg-white rounded-xl border border-stone-200 p-1 shadow-sm">
            {['Menunggu Validasi', 'Dikonfirmasi', 'Belum Bayar'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-emerald-100 text-emerald-700 shadow-sm' 
                    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchPayments}
            className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Area Utama */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-stone-50/50">
          <div className="relative w-full sm:w-80">
            <input 
              type="text" 
              placeholder="Cari ID Invoice atau Nama Pelanggan..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" 
            />
            <Search size={16} className="absolute left-3.5 top-3 text-stone-400" />
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-stone-600 px-4 py-2.5 border border-stone-200 rounded-xl hover:bg-stone-100 transition w-full sm:w-auto justify-center">
            <Filter size={16} /> Urutkan Terbaru
          </button>
        </div>

        {/* Tabel Validasi */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">ID Invoice</th>
                <th className="px-6 py-4">Pelanggan & Paket</th>
                <th className="px-6 py-4">Nominal Tagihan</th>
                <th className="px-6 py-4">Info Pembayaran</th>
                <th className="px-6 py-4 text-center">Bukti Transfer</th>
                <th className="px-6 py-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-emerald-600">{pay.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-stone-900">{pay.user}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{pay.paket}</p>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-stone-800">{pay.nominal}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-700">{pay.metode}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{pay.tanggal}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!pay.bukti_tf ? (
                        <span className="text-xs text-stone-400 italic">Belum ada</span>
                      ) : (
                        <a 
                          href={`http://localhost:6969/upload/${pay.bukti_tf}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition mx-auto"
                        >
                          <Receipt size={14} /> Lihat Bukti
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {pay.status === "Menunggu Validasi" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleReject(pay.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" 
                            title="Tolak Pembayaran"
                          >
                            <XCircle size={20} />
                          </button>
                          <button 
                            onClick={() => handleConfirm(pay.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                          >
                            <CheckCircle size={16} /> Konfirmasi
                          </button>
                        </div>
                      ) : pay.status === "Dikonfirmasi" ? (
                        <div className="flex items-center justify-end gap-3">
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-lg animate-in fade-in duration-300">
                            <CheckCircle size={14} /> Sah
                          </span>
                          <button 
                            onClick={() => handleCancelOrder(pay.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition duration-300 cursor-pointer"
                            title="Batalkan Pesanan Secara Manual"
                          >
                            <XCircle size={14} /> Batalkan
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-3">
                          <span className="inline-flex items-center gap-1.5 text-orange-500 text-xs font-bold bg-orange-50 px-3 py-1.5 rounded-lg">
                            <AlertCircle size={14} /> Menunggu User
                          </span>
                          <button 
                            onClick={() => handleCancelOrder(pay.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition duration-300 cursor-pointer"
                            title="Batalkan Pesanan Secara Manual"
                          >
                            <XCircle size={14} /> Batalkan
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center">
                      <Receipt size={40} className="text-stone-300 mb-3" />
                      <p className="font-medium">Tidak ada data untuk status ini.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}