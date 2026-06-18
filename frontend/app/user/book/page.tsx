"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Tent, Map, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form State
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedTent, setSelectedTent] = useState<string | null>(null);
  
  // Data dari Database
  const [packagesDB, setPackagesDB] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookedTents, setBookedTents] = useState<string[]>([]);

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
            prefix: p.paket_id === 1 ? "S" : p.paket_id === 2 ? "D" : "F",
            totalTenda: p.paket_id === 3 ? 20 : 10 
          }));
          setPackagesDB(formattedPackages);
        } else {
          console.error("Gagal menarik data paket dari server");
        }
      } catch (error) {
        console.error("Server backend belum menyala:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const generateTents = () => {
    if (!selectedPackage) return [];
    const tents = [];
    for (let i = 1; i <= selectedPackage.totalTenda; i++) {
      const nomor = `${selectedPackage.prefix}${i.toString().padStart(2, '0')}`;
      tents.push(nomor);
    }
    return tents;
  };
  useEffect(() => {
    const fetchBookedTents = async () => {
      try {
        const res = await fetch(`http://localhost:6969/api/tents/booked?check_in=${checkIn}&check_out=${checkOut}&paket_id=${selectedPackage.id}`);
        if (res.ok) {
          const data = await res.json();
          setBookedTents(data.booked_tents);
        } else {
          console.error("Gagal menarik data tenda terbooking");
        }
      } catch (err) {
        console.error("Gagal menghubungi server backend:", err);
      }
      setSelectedTent(null);
    };

    if (selectedPackage && checkIn && checkOut) {
      fetchBookedTents();
    } else {
      setBookedTents([]);
    }
  }, [selectedPackage, checkIn, checkOut]);

  const handleNext = () => {
    if (step === 1 && (!checkIn || !checkOut)) return alert("Pilih tanggal terlebih dahulu!");
    if (step === 2 && !selectedPackage) return alert("Pilih paket camping!");
    if (step === 3 && !selectedTent) return alert("Pilih posisi tenda!");
    
    if (step < 4) setStep(step + 1);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:6969/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          check_in: checkIn,
          check_out: checkOut,
          paket_id: selectedPackage?.id,
          nomor_tent: selectedTent,
          total_harga: selectedPackage?.harga * calculateNights()
        }),
        credentials: 'include'
      });

      if (response.ok) {
        alert(`Berhasil! Tenda ${selectedTent} telah di-booking.`);
        router.push('/user/dashboard');
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Gagal membuat booking tenda.");
      }
    } catch (error) {
      console.error("Gagal menghubungi server:", error);
      alert("Terjadi kesalahan jaringan atau server backend belum menyala.");
    }
  };
  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER & PROGRESS BAR */}
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


        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm min-h-[400px]">
          
          {/* PILIH TANGGAL */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2"><CalendarDays className="text-emerald-500"/> Pilih Tanggal Camping</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-2">Tanggal Check-in</label>
                  <input 
                    type="date" 
                    value={checkIn} 
                    onChange={(e) => setCheckIn(e.target.value)} 
                    min={new Date().toISOString().split('T')[0]} 
                    className="w-full p-4 bg-stone-50 border border-stone-200 text-stone-900 font-medium rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-2">Tanggal Check-out</label>
                  <input 
                    type="date" 
                    value={checkOut} 
                    onChange={(e) => setCheckOut(e.target.value)} 
                    min={checkIn || new Date().toISOString().split('T')[0]} 
                    className="w-full p-4 bg-stone-50 border border-stone-200 text-stone-900 font-medium rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  />
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
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                </div>
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

          {/* DENAH TENDA */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2"><Map className="text-emerald-500"/> Denah Tenda </h2>
                <div className="flex gap-4 text-xs font-bold text-stone-500 bg-stone-100 px-4 py-2 rounded-full">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-stone-100 border-2 border-emerald-500"></div> Tersedia</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-stone-200"></div> Penuh</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Dipilih</span>
                </div>
              </div>

              <div className="bg-stone-100 p-8 rounded-3xl border border-stone-200 relative overflow-hidden">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-stone-400 text-xs font-extrabold uppercase tracking-widest bg-white px-4 py-1 rounded-full shadow-sm">Jalur Utama / Pintu Masuk</div>
                
                <div className={`grid mt-8 gap-4 ${selectedPackage?.id === 3 ? 'grid-cols-4 md:grid-cols-5' : 'grid-cols-3 md:grid-cols-5'}`}>
                  {generateTents().map((tanda) => {
                    const isBooked = bookedTents.includes(tanda);
                    const isSelected = selectedTent === tanda;

                    return (
                      <button
                        key={tanda}
                        disabled={isBooked}
                        onClick={() => setSelectedTent(tanda)}
                        className={`
                          relative p-4 rounded-xl font-bold text-sm transition-all duration-300 flex flex-col items-center gap-2
                          ${isBooked ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300' : 
                            isSelected ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110 border border-emerald-400 z-10' : 
                            'bg-white text-emerald-700 hover:bg-emerald-50 border-2 border-emerald-400 hover:scale-105'}
                        `}
                      >
                        <Tent size={24} className={isBooked ? 'opacity-50' : ''} />
                        {tanda}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!selectedTent && (
                <p className="text-center text-sm text-stone-500 mt-6 flex items-center justify-center gap-2">
                  <AlertCircle size={16} className="text-orange-500" /> Klik pada tenda berwarna putih untuk memilih posisi.
                </p>
              )}
            </div>
          )}

          {/* KONFIRMASI & BAYAR */}
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
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
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
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-stone-900/20 transition"
            >
              Selanjutnya <ChevronRight size={20} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-full font-bold shadow-xl shadow-emerald-600/30 transition transform hover:scale-105"
            >
              Buat Pesanan Sekarang <CheckCircle2 size={20} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}