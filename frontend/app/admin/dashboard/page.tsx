"use client";

import { useState } from 'react';
import { Tent, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState([
    { id: "CAMP-001", name: "Dipta", package: "Paket Double", total: "Rp 250.000", status: "Menunggu Verifikasi" },
    { id: "CAMP-002", name: "Dayu", package: "Paket Family", total: "Rp 400.000", status: "Paid" },
    { id: "CAMP-003", name: "Ridwan", package: "Paket Single", total: "Rp 150.000", status: "Menunggu Pembayaran" },
  ]);

  const confirmPayment = (id: string) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: "Paid" } : b));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Ringkasan Panel</h1>
        <p className="text-stone-500 text-sm mt-1">Selamat datang kembali! Berikut kondisi reservasi campground hari ini.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div><p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Reservasi</p><h3 className="text-2xl font-extrabold text-stone-800 mt-1">148</h3></div>
          <div className="p-3 bg-stone-100 text-stone-600 rounded-xl"><ClipboardList size={20} /></div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div><p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Tenda Terpakai</p><h3 className="text-2xl font-extrabold text-stone-800 mt-1">32</h3></div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Tent size={20} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div><p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Butuh Verifikasi</p><h3 className="text-2xl font-extrabold text-orange-600 mt-1">5</h3></div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><AlertCircle size={20} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div><p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Selesai (Paid)</p><h3 className="text-2xl font-extrabold text-emerald-600 mt-1">111</h3></div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={20} /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-100"><h2 className="text-lg font-bold text-stone-800">Persetujuan Transaksi Masuk</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">ID Pesanan</th><th className="px-6 py-4">Pelanggan</th><th className="px-6 py-4">Paket</th><th className="px-6 py-4">Biaya</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {bookings.map((row) => (
                <tr key={row.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-stone-500">{row.id}</td>
                  <td className="px-6 py-4 font-bold text-stone-900">{row.name}</td>
                  <td className="px-6 py-4 font-medium">{row.package}</td>
                  <td className="px-6 py-4 font-bold">{row.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${row.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : row.status === 'Menunggu Verifikasi' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {row.status === "Menunggu Verifikasi" ? (
                      <button onClick={() => confirmPayment(row.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition">Konfirmasi</button>
                    ) : <span className="text-stone-400 text-xs font-medium italic">Selesai</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}