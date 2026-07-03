"use client";

import { useState, useEffect } from "react";
import { DollarSign, CheckCircle, Clock, XCircle, TrendingUp, RefreshCw, Calendar } from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchFinanceSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:6969/api/admin/finance/summary", {
        credentials: "include",
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        console.error("Gagal mengambil ringkasan keuangan");
      }
    } catch (err) {
      console.error("Error fetching finance summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceSummary();
  }, []);

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "telah_dibayar":
        return "bg-emerald-100 text-emerald-800";
      case "menunggu_konfirmasi":
        return "bg-amber-100 text-amber-800";
      case "menunggu_pembayaran":
        return "bg-blue-100 text-blue-800";
      case "expired":
      case "dibatalkan":
      case "ditolak_admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-stone-100 text-stone-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, " ").toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="animate-spin text-emerald-500" size={40} />
        <p className="text-stone-500 font-medium">Memuat laporan keuangan...</p>
      </div>
    );
  }

  const maxMonthTotal = data?.monthly_income?.length > 0 
    ? Math.max(...data.monthly_income.map((m: any) => m.total)) 
    : 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Dashboard Keuangan</h1>
          <p className="text-stone-500 text-sm mt-1">Laporan finansial, total pemasukan, dan log transaksi reservasi camping.</p>
        </div>
        <button
          onClick={fetchFinanceSummary}
          className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={16} /> Refresh Laporan
        </button>
      </div>

      {/* Cards Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pendapatan */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-4 bottom-4 opacity-15">
            <DollarSign size={80} />
          </div>
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Total Pendapatan</p>
          <h3 className="text-xl sm:text-2xl lg:text-lg xl:text-3xl font-black mt-2 tracking-tight truncate" title={formatRupiah(data?.total_income || 0)}>{formatRupiah(data?.total_income || 0)}</h3>
          <div className="flex items-center gap-1.5 mt-4 text-emerald-100 text-xs font-semibold">
            <TrendingUp size={14} />
            <span>Pemasukan Bersih Diterima</span>
          </div>
        </div>

        {/* Transaksi Sukses */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 bottom-4 text-emerald-500/10">
            <CheckCircle size={80} />
          </div>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">Transaksi Sukses</p>
          <h3 className="text-xl sm:text-2xl lg:text-lg xl:text-3xl font-black text-stone-800 mt-2 tracking-tight truncate">{data?.success_transactions || 0}</h3>
          <p className="text-emerald-600 text-xs font-semibold mt-4">Telah Selesai Dibayar</p>
        </div>

        {/* Menunggu Konfirmasi */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 bottom-4 text-amber-500/10">
            <Clock size={80} />
          </div>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">Perlu Verifikasi</p>
          <h3 className="text-xl sm:text-2xl lg:text-lg xl:text-3xl font-black text-stone-800 mt-2 tracking-tight truncate">{data?.pending_transactions || 0}</h3>
          <p className="text-amber-600 text-xs font-semibold mt-4">Bukti TF Menunggu Konfirmasi</p>
        </div>

        {/* Transaksi Gagal / Batal */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 bottom-4 text-red-500/10">
            <XCircle size={80} />
          </div>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">Transaksi Gagal</p>
          <h3 className="text-xl sm:text-2xl lg:text-lg xl:text-3xl font-black text-stone-800 mt-2 tracking-tight truncate">{data?.failed_transactions || 0}</h3>
          <p className="text-red-500 text-xs font-semibold mt-4">Batal, Expired, atau Ditolak</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grafik Pendapatan Bulanan */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-stone-100 pb-4">
            <h2 className="text-lg font-bold text-stone-800">Visualisasi Pendapatan Bulanan</h2>
            <span className="text-stone-400 text-xs font-semibold flex items-center gap-1">
              <Calendar size={14} /> Berdasarkan Tanggal Pembayaran
            </span>
          </div>

          {data?.monthly_income && data.monthly_income.length > 0 ? (
            <div className="space-y-4 pt-2">
              {data.monthly_income.map((month: any) => {
                const percentage = (month.total / maxMonthTotal) * 100;
                return (
                  <div key={month.bulan} className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-stone-600">{month.bulan}</span>
                      <span className="text-stone-800">{formatRupiah(month.total)}</span>
                    </div>
                    <div className="w-full bg-stone-100 h-6 rounded-lg overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-lg transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-stone-400 text-sm font-medium">Belum ada rekapitulasi data pendapatan.</p>
            </div>
          )}
        </div>

        {/* Transaksi Terbaru */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-lg font-bold text-stone-800">Transaksi Terbaru</h2>
          </div>

          <div className="divide-y divide-stone-100">
            {data?.recent_transactions && data.recent_transactions.length > 0 ? (
              data.recent_transactions.map((tx: any) => (
                <div key={tx.pemesanan_id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-stone-800">{tx.user_nama}</p>
                    <p className="text-xs text-stone-400 font-semibold">ID Booking: #{tx.pemesanan_id}</p>
                    <p className="text-xs text-stone-400 font-medium">{tx.created_at.split(".")[0]}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-sm font-black text-stone-800">{formatRupiah(tx.total_harga)}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${getStatusColor(tx.status_pemesanan)}`}>
                      {getStatusLabel(tx.status_pemesanan)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-stone-400 text-sm py-8 font-medium">Belum ada transaksi.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}