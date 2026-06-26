"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tent, MapPin, CalendarClock, ArrowRight, Clock, CheckCircle2, FileText, CreditCard, Search } from 'lucide-react';
import Swal from "sweetalert2";

export default function UserDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('http://localhost:6969/api/bookings', {
          credentials: 'include' // Ambil data milik user yang sedang login
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.bookings);
        }
      } catch (err) {
        console.error("Gagal menarik data pesanan", err);
      }
    };
    fetchBookings();
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

      <div className="bg-emerald-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl shadow-emerald-600/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/50 rounded-full text-xs font-bold tracking-wide">
            <CalendarClock size={14} /> Status Saat Ini
          </div>
          <h2 className="text-3xl font-extrabold">
            {orders.length > 0 && orders[0].status_pemesanan === 'menunggu_pembayaran' ? 'Menunggu Pembayaran' : 
             orders.length > 0 && orders[0].status_pemesanan === 'menunggu_konfirmasi' ? 'Sedang Diverifikasi Admin' :
             orders.length > 0 && orders[0].status_pemesanan === 'telah_dibayar' ? 'Perkemahan Terjadwal' : 
             orders.length > 0 && (orders[0].status_pemesanan === 'dibatalkan' || orders[0].status_pemesanan === 'expired') ? 'Pesanan Tidak Aktif' :
             'Belum Ada Perkemahan Terjadwal'}
          </h2>
          <p className="text-emerald-100 max-w-md">
            {orders.length > 0 && orders[0].status_pemesanan === 'menunggu_pembayaran' ? `Segera selesaikan pembayaran untuk mengamankan tenda ${orders[0].nomor_tent}.` : 
             orders.length > 0 && orders[0].status_pemesanan === 'menunggu_konfirmasi' ? `Bukti pembayaran tenda ${orders[0].nomor_tent} sudah diterima. Admin akan segera memverifikasinya.` :
             orders.length > 0 && orders[0].status_pemesanan === 'telah_dibayar' ? `Tenda ${orders[0].nomor_tent} sudah siap! Jangan lupa bawa perlengkapan pribadi.` :
             orders.length > 0 && (orders[0].status_pemesanan === 'dibatalkan' || orders[0].status_pemesanan === 'expired') ? 'Pesanan ini tidak berhasil diproses. Silakan buat pesanan baru.' :
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
            orders.map((order) => (
              <div key={order.pemesanan_id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-stone-50 border border-stone-200 rounded-2xl gap-6">
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-white border border-stone-200 rounded-full text-xs font-bold text-stone-500">
                      ID: {order.pemesanan_id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      order.status_pemesanan === 'telah_dibayar' ? 'bg-emerald-100 text-emerald-700' : 
                      order.status_pemesanan === 'menunggu_konfirmasi' ? 'bg-blue-100 text-blue-700' :
                      (order.status_pemesanan === 'dibatalkan' || order.status_pemesanan === 'expired') ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status_pemesanan === 'telah_dibayar' ? <CheckCircle2 size={14}/> : 
                       order.status_pemesanan === 'menunggu_konfirmasi' ? <Search size={14}/> : <Clock size={14}/>}
                      
                      {order.status_pemesanan === 'menunggu_pembayaran' ? 'Menunggu Pembayaran' : 
                       order.status_pemesanan === 'menunggu_konfirmasi' ? 'Menunggu Verifikasi' : 
                       order.status_pemesanan === 'dibatalkan' ? 'Dibatalkan' : 
                       order.status_pemesanan === 'expired' ? 'Kadaluarsa' : 'Lunas'}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                      <Tent size={18} className="text-emerald-600"/> {order.nama_paket} <span className="text-stone-400 font-medium text-sm">(Posisi: {order.nomor_tent})</span>
                    </h3>
                    <p className="text-sm text-stone-500 mt-1">Check-in: <span className="font-semibold text-stone-700">{order.tanggal_checkin}</span> • Check-out: <span className="font-semibold text-stone-700">{order.tanggal_checkout}</span></p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3 border-t md:border-t-0 md:border-l border-stone-200 pt-4 md:pt-0 md:pl-6">
                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold text-stone-400 uppercase">Total Biaya</p>
                    <p className="text-xl font-extrabold text-emerald-600">{formatRupiah(order.total_harga)}</p>
                  </div>
                  
                  {order.status_pemesanan === 'menunggu_pembayaran' && (
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      {/* Tombol Bayar Sekarang */}
                      <button 
                        onClick={() =>
                          router.push(`/user/payment?pemesanan_id=${order.pemesanan_id}`)
                        }
                        className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 text-sm"
                      >
                        <CreditCard size={16} /> Bayar Sekarang
                      </button>

                    
                      <button 
                        onClick={async () => {
                          const result = await Swal.fire({
                            title: 'Batalkan Pesanan?',
                            text: "Pesanan ini akan dibatalkan dan tidak bisa dikembalikan.",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#e11d48',
                            cancelButtonColor: '#a8a29e',
                            confirmButtonText: 'Ya, Batalkan!',
                            cancelButtonText: 'Tidak'
                          });

                          if (result.isConfirmed) {
                            try {
                              const res = await fetch(`http://localhost:6969/api/bookings/${order.pemesanan_id}/cancel`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include' 
                              });
                              
                              if (res.ok) {
                                Swal.fire('Berhasil!', 'Pesanan telah dibatalkan.', 'success');
                                window.location.reload(); 
                              } else {
                                const errorData = await res.json();
                                Swal.fire('Gagal!', errorData.detail || "Gagal membatalkan pesanan.", 'error');
                              }
                            } catch (err) {
                              Swal.fire('Error!', "Terjadi kesalahan koneksi.", 'error');
                            }
                          }
                        }}
                        className="w-full md:w-auto bg-red-400 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm border border-red-100"
                      >
                        Batalkan Pesanan
                      </button>
                    </div>
                  )}
                  {order.status_pemesanan === 'menunggu_konfirmasi' && (
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