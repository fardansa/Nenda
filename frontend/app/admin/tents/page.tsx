"use client";

import { useState, useEffect } from 'react';
import { Search, RefreshCw, Check, X } from 'lucide-react';

export default function ManageTentsPage() {
  const [tents, setTents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchTents = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:6969/api/admin/tents', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setTents(data.tents);
      } else {
        console.error("Failed to fetch tents");
      }
    } catch (err) {
      console.error("Error fetching tents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTents();
  }, []);

  const toggleStatus = async (tentId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'tersedia' ? 'tidak tersedia' : 'tersedia';
    setUpdatingId(tentId);
    try {
      const res = await fetch(`http://localhost:6969/api/admin/tents/${tentId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
        credentials: 'include'
      });
      if (res.ok) {
        setTents(prev =>
          prev.map(t => t.tent_id === tentId ? { ...t, status: nextStatus } : t)
        );
      } else {
        alert("Gagal mengubah status tenda.");
      }
    } catch (err) {
      console.error("Error updating tent status:", err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(price);
  };

  const filteredTents = tents.filter(tent => {
    const matchesSearch = 
      tent.nomor_tent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tent.nama_paket.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      statusFilter === "semua" || 
      tent.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Status Tenda</h1>
          <p className="text-stone-500 text-sm mt-1">Pantau dan ubah status ketersediaan masing-masing unit tenda.</p>
        </div>
        <button 
          onClick={fetchTents}
          className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Toolbar Pencarian */}
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-stone-50/50">
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Cari nomor tenda atau paket..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition bg-white" 
            />
            <Search size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider hidden md:inline">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition bg-white font-medium text-stone-700 w-full sm:w-auto"
            >
              <option value="semua">Semua Status</option>
              <option value="tersedia">Tersedia</option>
              <option value="tidak tersedia">Tidak Tersedia</option>
            </select>
          </div>
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
                <th className="px-6 py-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="animate-spin text-emerald-500 mb-3" size={32} />
                      <p className="font-medium">Memuat data tenda...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTents.length > 0 ? (
                filteredTents.map((tent) => (
                  <tr key={tent.tent_id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-stone-900">{tent.nomor_tent}</td>
                    <td className="px-6 py-4 font-medium text-stone-500">{tent.nomor_loker}</td>
                    <td className="px-6 py-4 font-bold">{tent.nama_paket}</td>
                    <td className="px-6 py-4 font-medium">{formatRupiah(tent.harga)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                        tent.status === 'tersedia' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {tent.status === 'tersedia' ? <Check size={12} /> : <X size={12} />}
                        {tent.status === 'tersedia' ? 'Tersedia' : 'Tidak Tersedia'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toggleStatus(tent.tent_id, tent.status)}
                        disabled={updatingId === tent.tent_id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer disabled:opacity-50 ${
                          tent.status === 'tersedia' 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {updatingId === tent.tent_id ? 'Memproses...' : tent.status === 'tersedia' ? 'Set Tidak Tersedia' : 'Set Tersedia'}
                      </button>
                    </td>
                  </tr>
                ))
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
    </div>
  );
}