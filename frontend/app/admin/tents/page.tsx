"use client";

import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

export default function ManageTentsPage() {
  // Data simulasi (Nantinya di-fetch dari API /api/tents backend kamu)
  const [tents, setTents] = useState([
    { id: 1, nomor_tent: "T-01", loker: "L-A1", paket: "Luxury Tent", harga: "Rp 750.000", status: "Tersedia" },
    { id: 2, nomor_tent: "T-02", loker: "L-A2", paket: "Campfire Feast", harga: "Rp 400.000", status: "Terisi" },
    { id: 3, nomor_tent: "T-03", loker: "L-B1", paket: "Lakeside Retreat", harga: "Rp 600.000", status: "Maintenance" },
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Manajemen Tenda</h1>
          <p className="text-stone-500 text-sm mt-1">Kelola data inventaris tenda, loker, dan alokasi paket.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2">
          <Plus size={18} /> Tambah Data
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Toolbar Pencarian */}
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-stone-50/50">
          <div className="relative w-full sm:w-72">
            <input type="text" placeholder="Cari nomor tenda atau paket..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" />
            <Search size={16} className="absolute left-3.5 top-3 text-stone-400" />
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-stone-600 px-4 py-2.5 border border-stone-200 rounded-xl hover:bg-stone-100 transition w-full sm:w-auto justify-center">
            <Filter size={16} /> Filter Status
          </button>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Nomor Tenda</th>
                <th className="px-6 py-4">Nomor Loker</th>
                <th className="px-6 py-4">Nama Paket</th>
                <th className="px-6 py-4">Harga / Malam</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {tents.map((tent) => (
                <tr key={tent.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-stone-900">{tent.nomor_tent}</td>
                  <td className="px-6 py-4 font-medium text-stone-500">{tent.loker}</td>
                  <td className="px-6 py-4 font-bold">{tent.paket}</td>
                  <td className="px-6 py-4 font-medium">{tent.harga}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      tent.status === 'Tersedia' ? 'bg-emerald-100 text-emerald-700' : 
                      tent.status === 'Terisi' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {tent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
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