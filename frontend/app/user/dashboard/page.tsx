"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tent, MapPin, CalendarClock, ArrowRight, Clock, CheckCircle2, FileText, CreditCard, Search } from 'lucide-react';

export default function UserDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('nenda_orders') || '[]');
    setOrders(savedOrders);
  }, []);

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      <div>
        <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">Dashboard Saya</h1>
        <p className="text-stone-500 text-sm mt-1">Pantau pesanan tenda kamu dan bersiaplah untuk petualangan selanjutnya.</p>
      </div>

      {/* Kartu Status Pemesanan */}
      <div className="bg-emerald-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl shadow-emerald-600/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative z-10 flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/50 rounded-full text-xs font-bold tracking-wide">
            <CalendarClock size={14} /> Status Saat Ini
          </div>
          <h2 className="text-3xl font-extrabold">
            {orders.length > 0 && orders[0].status === 'menunggu_pembayaran' ? 'Menunggu Pembayaran' : 
             orders.length > 0 && orders[0].status === 'menunggu_verifikasi' ? 'Sedang Diverifikasi Admin' :
             orders.length > 0 && orders[0].status === 'telah_dibayar' ? 'Perkemahan Terjadwal' : 
             'Belum Ada Perkemahan Terjadwal'}
          </h2>
          <p className="text-emerald-100 max-w-md">
            {orders.length > 0 && orders[0].status === 'menunggu_pembayaran' ? `Segera selesaikan pembayaran untuk mengamankan tenda ${orders[0].tenda} kamu.` : 
             orders.length > 0 && orders[0].status === 'menunggu_verifikasi' ? `Bukti pembayaran tenda ${orders[0].tenda} sudah diterima. Admin akan segera memverifikasinya.` :
             orders.length > 0 && orders[0].status === 'telah_dibayar' ? `Tenda ${orders[0].tenda} sudah siap! Jangan lupa bawa perlengkapan pribadi.` :
            'Kamu belum memiliki reservasi tenda yang aktif. Yuk, rencanakan liburanmu!'}
          </p>
        </div>
        
        <div className="relative z-10 mt-8 md:mt-0">
          <Link href="/user/book" className="group flex items-center gap-2 bg-white text-emerald-600 px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            Pesan Tenda Baru
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Grid Menu Tambahan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><MapPin size={24} /></div>
          <h3 className="text-lg font-bold text-stone-800 mb-2">Panduan Lokasi</h3>
          <p className="text-sm text-stone-500">Lihat peta rute menuju campground Nenda dan informasi fasilitas sekitar.</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-stone-100 text-stone-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Tent size={24} /></div>
          <h3 className="text-lg font-bold text-stone-800 mb-2">Aturan Perkemahan</h3>
          <p className="text-sm text-stone-500">Baca peraturan, syarat, dan ketentuan selama menginap di area campground.</p>
        </div>
      </div>

      {/* Riwayat Pesanan */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm mt-8">
        <div className="p-6 border-b border-stone-100 flex items-center gap-3">
          <FileText className="text-emerald-500" />
          <h2 className="text-xl font-bold text-stone-800">Riwayat Pesanan Saya</h2>
        </div>
        
        <div className="p-6 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Tent size={48} className="mx-auto text-stone-200 mb-3" />
              <p className="text-stone-500 font-medium">Kamu belum memiliki riwayat pesanan.</p>
            </div>
          ) : (
            orders.map((order, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-stone-50 border border-stone-200 rounded-2xl gap-6 hover:border-emerald-200 transition-colors">
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-white border border-stone-200 rounded-full text-xs font-bold text-stone-500">
                      ID: {order.id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      order.status === 'telah_dibayar' ? 'bg-emerald-100 text-emerald-700' : 
                      order.status === 'menunggu_verifikasi' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status === 'telah_dibayar' ? <CheckCircle2 size={14}/> : 
                       order.status === 'menunggu_verifikasi' ? <Search size={14}/> : <Clock size={14}/>}
                      
                      {order.status === 'menunggu_pembayaran' ? 'Menunggu Pembayaran' : 
                       order.status === 'menunggu_verifikasi' ? 'Menunggu Verifikasi' : 'Lunas'}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                      <Tent size={18} className="text-emerald-600"/> {order.paket} <span className="text-stone-400 font-medium text-sm">(Posisi: {order.tenda})</span>
                    </h3>
                    <p className="text-sm text-stone-500 mt-1">Check-in: <span className="font-semibold text-stone-700">{order.checkIn}</span> • Check-out: <span className="font-semibold text-stone-700">{order.checkOut}</span></p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3 border-t md:border-t-0 md:border-l border-stone-200 pt-4 md:pt-0 md:pl-6">
                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold text-stone-400 uppercase">Total Biaya</p>
                    <p className="text-xl font-extrabold text-emerald-600">{formatRupiah(order.total)}</p>
                  </div>
                  
                  {order.status === 'menunggu_pembayaran' && (
                    <button 
                      onClick={() => router.push(`/user/payment`)}
                      className="w-full md:w-auto bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 text-sm"
                    >
                      <CreditCard size={16} /> Bayar Sekarang
                    </button>
                  )}
                  {order.status === 'menunggu_verifikasi' && (
                    <p className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg text-center w-full md:w-auto">
                      Bukti Terkirim
                    </p>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}