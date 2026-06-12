"use client";

import Link from 'next/link';
import { Tent, MapPin, CalendarClock, ArrowRight } from 'lucide-react';

export default function UserDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Judul & Sapaan */}
      <div>
        <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Dashboard Saya</h1>
        <p className="text-stone-500 text-sm mt-1">Pantau pesanan tenda kamu dan bersiaplah untuk petualangan selanjutnya.</p>
      </div>

      {/* Kartu Status Pemesanan Aktif */}
      <div className="bg-emerald-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl shadow-emerald-600/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative z-10 flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/50 rounded-full text-xs font-bold tracking-wide">
            <CalendarClock size={14} /> Status Saat Ini
          </div>
          <h2 className="text-3xl font-extrabold">Belum Ada Perkemahan Terjadwal</h2>
          <p className="text-emerald-100 max-w-md">
            Kamu belum memiliki reservasi tenda yang aktif. Yuk, lihat katalog tenda kami dan rencanakan liburanmu akhir pekan ini!
          </p>
        </div>
        
        <div className="relative z-10 mt-8 md:mt-0">
          <Link href="/#katalog" className="group flex items-center gap-2 bg-white text-emerald-600 px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            Eksplorasi Tenda
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Grid Menu Tambahan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MapPin size={24} />
          </div>
          <h3 className="text-lg font-bold text-stone-800 mb-2">Panduan Lokasi</h3>
          <p className="text-sm text-stone-500">Lihat peta rute menuju campground Nenda dan informasi fasilitas sekitar.</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-stone-100 text-stone-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Tent size={24} />
          </div>
          <h3 className="text-lg font-bold text-stone-800 mb-2">Aturan Perkemahan</h3>
          <p className="text-sm text-stone-500">Baca peraturan, syarat, dan ketentuan selama menginap di area campground.</p>
        </div>
      </div>

    </div>
  );
}