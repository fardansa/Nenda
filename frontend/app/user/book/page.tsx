"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Tent, Map, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, MapPin } from 'lucide-react';

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form State
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedTent, setSelectedTent] = useState<string | null>(null);
  
  // Data State
  const [packagesDB, setPackagesDB] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookedTents, setBookedTents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tentCoordinates = [
    //  AREA SINGLE (S01 - S10) 
    { id: 'S01', top: '15%', left: '33%' }, { id: 'S02', top: '15%', left: '38%' }, { id: 'S03', top: '15%', left: '43%' }, { id: 'S04', top: '15%', left: '48%' }, { id: 'S05', top: '15%', left: '53%' },
    { id: 'S06', top: '26%', left: '32%' }, { id: 'S07', top: '26%', left: '37%' }, { id: 'S08', top: '26%', left: '42%' }, { id: 'S09', top: '26%', left: '47%' }, { id: 'S10', top: '26%', left: '52%' },

    //  AREA DOUBLE (D01 - D10) 
    { id: 'D01', top: '44%', left: '25%' }, { id: 'D02', top: '44%', left: '31%' }, { id: 'D03', top: '44%', left: '37%' }, { id: 'D04', top: '44%', left: '42%' }, { id: 'D05', top: '44%', left: '47%' },
    { id: 'D06', top: '56%', left: '24%' }, { id: 'D07', top: '56%', left: '30%' }, { id: 'D08', top: '56%', left: '36%' }, { id: 'D09', top: '56%', left: '41%' }, { id: 'D10', top: '56%', left: '46%' },

    //  AREA FAMILY (F01 - F20) 
    { id: 'F01', top: '42%', left: '62%' }, { id: 'F02', top: '42%', left: '69%' }, { id: 'F03', top: '42%', left: '76%' }, { id: 'F04', top: '42%', left: '83%' },
    { id: 'F05', top: '52%', left: '59%' }, { id: 'F06', top: '52%', left: '67%' }, { id: 'F07', top: '52%', left: '79%' }, { id: 'F08', top: '52%', left: '86%' }, 
    { id: 'F09', top: '62%', left: '61%' }, { id: 'F10', top: '62%', left: '68%' }, { id: 'F11', top: '62%', left: '80%' }, { id: 'F12', top: '62%', left: '87%' }, 
    { id: 'F13', top: '73%', left: '60%' }, { id: 'F14', top: '73%', left: '67%' }, { id: 'F15', top: '73%', left: '74%' }, { id: 'F16', top: '73%', left: '81%' }, 
    { id: 'F17', top: '73%', left: '88%' }, { id: 'F19', top: '83%', left: '74%' }, { id: 'F20', top: '83%', left: '81%' },
  ];

  // Data Paket 
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('http://localhost:6969/api/tents');
        if (response.ok) {
          const data = await response.json();
          const formattedPackages = data.tents.map((p: any) => ({
            id: p.paket_id,
            nama: p.nama_paket.toUpperCase(), 
            harga: p.harga,
            kapasitas: p.kapasitas,
            prefix: p.nama_paket.charAt(0).toUpperCase() // 's' -> 'S', 'd' -> 'D', 'f' -> 'F'
          }));
          setPackagesDB(formattedPackages);
        }
      } catch (error) {
        console.error("Gagal menarik data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // Cek Ketersediaan Tenda dari Database berdasarkan Tanggal & Paket
  useEffect(() => {
    if (selectedPackage && checkIn && checkOut) {
      const fetchAvailability = async () => {
        try {
          const res = await fetch(`http://localhost:6969/api/tents/booked?check_in=${checkIn}&check_out=${checkOut}&paket_id=${selectedPackage.id}`);
          if (res.ok) {
            const data = await res.json();
            setBookedTents(data.booked_tents);
          }
        } catch (err) {
          console.error("Gagal mengecek ketersediaan", err);
        }
      };
      fetchAvailability();
      setSelectedTent(null); 
    }
  }, [selectedPackage, checkIn, checkOut]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const handleNext = () => {
    if (step === 1 && (!checkIn || !checkOut)) return alert("Pilih tanggal terlebih dahulu!");
    if (step === 2 && !selectedPackage) return alert("Pilih paket camping!");
    if (step === 3 && !selectedTent) return alert("Pilih posisi tenda!");
    if (step < 4) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload = {
      check_in: checkIn,
      check_out: checkOut,
      paket_id: selectedPackage.id,
      nomor_tent: selectedTent,
      total_harga: selectedPackage.harga * calculateNights()
    };

    try {
      const res = await fetch('http://localhost:6969/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Pesanan berhasil dibuat!");
        router.push('/user/dashboard'); 
      } else {
        const errorData = await res.json();
        alert(`Gagal: ${errorData.detail}`);
      }
    } catch (err) {
      alert("Terjadi kesalahan pada server saat memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Reservasi Tenda</h1>
          <p className="text-stone-500 mt-2 text-sm">Ikuti langkah-langkah berikut untuk mengamankan tendamu.</p>
          
          <div className="flex items-center justify-between mt-8 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-200 -z-10 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
            
            {[
              { num: 1, icon: CalendarDays, label: "Tanggal" },
              { num: 2, icon: Tent, label: "Paket" },
              { num: 3, icon: Map, label: "Posisi" },
              { num: 4, icon: CheckCircle2, label: "Konfirmasi" }
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-colors ${step >= s.num ? 'bg-emerald-500 border-emerald-100 text-white shadow-lg' : 'bg-white border-stone-200 text-stone-400'}`}>
                  <s.icon size={20} />
                </div>
                <span className={`text-xs font-bold ${step >= s.num ? 'text-stone-800' : 'text-stone-400'}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm min-h-[400px]">
          
          {/* PILIH TANGGAL */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2"><CalendarDays className="text-emerald-500"/> Pilih Tanggal Camping</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-2">Tanggal Check-in</label>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full p-4 bg-stone-50 border border-stone-200 text-stone-900 font-medium rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-2">Tanggal Check-out</label>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-stone-50 border border-stone-200 text-stone-900 font-medium rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
              </div>
              {checkIn && checkOut && (
                <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800">
                  <CheckCircle2 size={24} />
                  <p className="font-medium">Sempurna! Kamu akan menginap selama <strong>{calculateNights()} malam</strong>.</p>
                </div>
              )}
            </div>
          )}

          {/* PILIH PAKET */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2"><Tent className="text-emerald-500"/> Pilih Paket Tenda</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {packagesDB.map((pkg) => (
                    <div 
                      key={pkg.id} 
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedPackage?.id === pkg.id ? 'border-emerald-500 bg-emerald-50 shadow-md transform scale-105' : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'}`}
                    >
                      <h3 className="font-extrabold text-lg text-stone-800 uppercase tracking-wide">Paket {pkg.nama}</h3>
                      <p className="text-stone-500 text-sm mt-1 mb-4">Kapasitas: {pkg.kapasitas} Orang</p>
                      <p className="text-xl font-black text-emerald-600">{formatRupiah(pkg.harga)} <span className="text-xs text-stone-400 font-normal">/ malam</span></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DENAH MAP */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2"><Map className="text-emerald-500"/> Pilih Posisi Tenda</h2>
                <div className="flex gap-4 text-xs font-bold text-stone-500 bg-stone-100 px-4 py-2 rounded-full">
                  <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse border border-white"></div> Tersedia</span>
                  <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div> Penuh</span>
                </div>
              </div>

              {/* Gambar */}
              <div className="relative w-full overflow-hidden rounded-3xl border-4 border-stone-200 shadow-inner bg-stone-900" style={{ aspectRatio: '16/10' }}>
                <img 
                  src="/denah.jpg" 
                  alt="Denah Campground" 
                  className="absolute inset-0 w-full h-full object-cover opacity-90"
                />

                {/* LOOPING MARKER/TOMBOL */}
                {tentCoordinates.map((tanda) => {
                  const isCurrentPackage = selectedPackage?.prefix === tanda.id.charAt(0);
                  const isBooked = bookedTents.includes(tanda.id);
                  const isSelected = selectedTent === tanda.id;

                  // Tenda milik paket lain 
                  if (!isCurrentPackage) {
                    return (
                      <div 
                        key={tanda.id} 
                        style={{ top: tanda.top, left: tanda.left }}
                        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50 border border-white/20 backdrop-blur-sm pointer-events-none"
                      />
                    );
                  }

                  // Tenda milik paket yang aktif
                  return (
                    <button
                      key={tanda.id}
                      disabled={isBooked}
                      onClick={() => setSelectedTent(tanda.id)}
                      style={{ top: tanda.top, left: tanda.left }}
                      title={`Tenda ${tanda.id} ${isBooked ? '(Penuh)' : '(Tersedia)'}`}
                      className={`
                        absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300
                        ${isSelected ? 'w-10 h-10 bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.8)] border-2 border-white scale-125 z-20 rounded-full' : 
                          isBooked ? 'w-6 h-6 bg-red-500/80 border border-white/50 cursor-not-allowed z-10 rounded-full' : 
                          'w-8 h-8 bg-emerald-400/80 hover:bg-emerald-500 border-2 border-white text-transparent hover:text-white cursor-pointer hover:scale-110 z-10 rounded-full animate-pulse hover:animate-none'}
                      `}
                    >
                      <span className={`font-black text-[10px] ${isSelected ? 'block' : 'hidden md:block opacity-0 hover:opacity-100'}`}>
                        {tanda.id}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              {selectedTent && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                  <p className="text-emerald-800 font-medium">Tenda <strong>{selectedTent}</strong> dipilih.</p>
                  <MapPin className="text-emerald-500" />
                </div>
              )}
            </div>
          )}

          {/* KONFIRMASI */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2"><CheckCircle2 className="text-emerald-500"/> Ringkasan Pesanan</h2>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  <div><p className="text-stone-500 mb-1">Check-in</p><p className="font-bold text-stone-900">{checkIn}</p></div>
                  <div><p className="text-stone-500 mb-1">Check-out</p><p className="font-bold text-stone-900">{checkOut}</p></div>
                  <div><p className="text-stone-500 mb-1">Durasi</p><p className="font-bold text-stone-900">{calculateNights()} Malam</p></div>
                  <div><p className="text-stone-500 mb-1">Posisi Tenda</p><p className="font-bold text-emerald-600 text-lg">{selectedTent}</p></div>
                </div>
                <hr className="my-6 border-stone-200" />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-stone-800 text-lg">Paket {selectedPackage?.nama}</h3>
                    <p className="text-stone-500 text-sm">{formatRupiah(selectedPackage?.harga)} x {calculateNights()} malam</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Tagihan</p>
                    <p className="text-3xl font-extrabold text-emerald-600">{formatRupiah(selectedPackage?.harga * calculateNights())}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="mt-8 flex justify-between">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : router.push('/user/dashboard')}
            className="flex items-center gap-2 px-6 py-3 text-stone-500 hover:text-stone-800 font-bold transition"
          >
            <ChevronLeft size={20} /> {step === 1 ? 'Batal' : 'Kembali'}
          </button>
          
          {step < 4 ? (
            <button onClick={handleNext} className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-stone-900/20 transition">
              Selanjutnya <ChevronRight size={20} />
            </button>
          ) : (
            <button disabled={isSubmitting} onClick={handleSubmit} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-full font-bold shadow-xl shadow-emerald-600/30 transition transform hover:scale-105">
              {isSubmitting ? 'Memproses...' : 'Buat Pesanan Sekarang'} <CheckCircle2 size={20} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}