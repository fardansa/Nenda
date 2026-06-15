"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tent, MapPin, Users, CheckCircle2, User } from 'lucide-react';
import InteractiveSelector from '@/components/ui/interactive-selector';
import Footer from '@/components/ui/footer';

export default function HomePage() {
  const [tents, setTents] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Cek status login dari LocalStorage
    const currentRole = localStorage.getItem('role');
    setRole(currentRole);

    // 2. Fetch data tenda dari FastAPI (Public Route)
    const fetchTents = async () => {
      try {
        const response = await fetch('http://localhost:6969/api/tents', {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          setTents(data.tents);
        } else {
          console.error("Gagal menarik data katalog");
        }
      } catch (error) {
        console.error("Server backend belum menyala:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTents();
  }, []);

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(price);
  };

  const handleBooking = (status: string) => {
    if (status !== 'Tersedia') return;
    
    if (role) {
      router.push('/user/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      
      {/* NAVBAR */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-stone-200 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-stone-900 font-extrabold text-2xl tracking-tighter">
            <Tent className="text-emerald-600" size={28} />
            Nenda<span className="text-emerald-600">.</span>
          </Link>

          <div className="hidden md:flex gap-8 font-semibold text-stone-600">
            <Link href="#" className="hover:text-emerald-600 transition">Beranda</Link>
            <Link href="#katalog" className="hover:text-emerald-600 transition">Katalog Tenda</Link>
            <Link href="#" className="hover:text-emerald-600 transition">Fasilitas</Link>
          </div>

          <div>
            {role ? (
              <button 
                onClick={() => router.push(role === 'admin' ? '/admin/dashboard' : '/user/dashboard')}
                className="flex items-center gap-3 bg-stone-100 hover:bg-stone-200 border border-stone-200 px-2 py-1.5 pr-5 rounded-full transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                  <User size={16} />
                </div>
                <span className="font-bold text-stone-700 text-sm">
                  {role === 'admin' ? 'Panel Admin' : 'Dashboard'}
                </span>
              </button>
            ) : (
              <Link href="/login" className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-stone-900/20 transition flex items-center gap-2 text-sm">
                Masuk / Daftar
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-10 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-extrabold tracking-wide uppercase">
            <MapPin size={14} /> Campground Terbaik
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-stone-900 tracking-tight leading-tight">
            Menyatu Dengan <span className="text-emerald-600">Alam.</span>
          </h1>
          <p className="text-lg text-stone-500 max-w-lg leading-relaxed">
            Sistem reservasi perkemahan yang memudahkanmu menemukan tenda terbaik. Pesan sekarang, bayar mudah, dan nikmati petualanganmu.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <a href="#katalog" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-full font-bold shadow-xl shadow-emerald-600/30 transition">
              Lihat Tenda
            </a>
          </div>
        </div>
        <div className="flex-1 w-full relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-3xl transform rotate-3 scale-105" />
          <img 
            src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&auto=format&fit=crop&q=80" 
            alt="Camping Hero" 
            className="rounded-3xl shadow-2xl relative z-10 w-full object-cover h-[500px]"
          />
        </div>
      </section>

      {/* INTERACTIVE SELECTOR SECTION */}
      <div className="max-w-7xl mx-auto px-6">
        <InteractiveSelector />
      </div>

      {/* TENTS / KATALOG SECTION */}
      <section id="katalog" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">Katalog Tenda</h2>
            <p className="text-stone-500 mt-3">Eksplorasi pilihan tenda kami. Kamu bisa masuk atau mendaftar saat proses pemesanan.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
            </div>
          ) : tents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tents.map((tent) => (
                <div key={tent.paket_id} className="bg-stone-50 border border-stone-200 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow group flex flex-col">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src="https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=600&auto=format&fit=crop" 
                      alt="Tent" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-stone-900 first-letter:uppercase">{tent.nama_paket}</h3>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        tent.status === 'Tersedia' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {tent.status === 'Tersedia' ? `${tent.available_count} Tenda Tersedia` : 'Tenda Penuh'}
                      </span>
                    </div>
                    <p className="text-stone-500 text-sm mb-4 line-clamp-2">{tent.deskripsi}</p>
                    
                    <div className="space-y-2 mb-6 flex-1">
                      <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                        <Users size={16} className="text-emerald-600" /> Kapasitas {tent.kapasitas} Orang
                      </div>
                      <div className="flex items-start gap-2 text-sm text-stone-600 font-medium">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" /> 
                        <span className="line-clamp-2">{tent.fasilitas}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-200 flex items-center justify-between mt-auto">
                      <div>
                        <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Harga per Malam</p>
                        <p className="text-xl font-extrabold text-emerald-600">{formatRupiah(tent.harga)}</p>
                      </div>
                      <button 
                        onClick={() => handleBooking(tent.status)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition cursor-pointer ${
                          tent.status === 'Tersedia' 
                            ? 'bg-stone-900 hover:bg-stone-800 text-white' 
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                        disabled={tent.status !== 'Tersedia'}
                      >
                        {tent.status === 'Tersedia' 
                          ? (role ? 'Pesan Sekarang' : 'Masuk untuk Pesan') 
                          : 'Tenda Penuh'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-20 text-stone-500">
               Belum ada data tenda yang tersedia di database.
             </div>
          )}
        </div>
      </section>

      {/* FOOTER SECTION */}
      <Footer />
      
    </div>
  );
}