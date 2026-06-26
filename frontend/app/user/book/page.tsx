"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Tent, Map, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, MapPin, X, Trash2 } from 'lucide-react';
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form State
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedTents, setSelectedTents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("SINGLE");
  
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
            prefix: p.nama_paket.charAt(0).toUpperCase() 
          }));
          setPackagesDB(formattedPackages);
          if (formattedPackages.length > 0) {
            setActiveTab(formattedPackages[0].nama);
          }
        }
      } catch (error) {
        console.error("Gagal menarik data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // Cek Ketersediaan Tenda
  useEffect(() => {
    if (checkIn && checkOut) {
      const fetchAvailability = async () => {
        try {
          const res = await fetch(`http://localhost:6969/api/tents/booked?check_in=${checkIn}&check_out=${checkOut}`);
          if (res.ok) {
            const data = await res.json();
            setBookedTents(data.booked_tents);
          }
        } catch (err) {
          console.error("Gagal mengecek ketersediaan", err);
        }
      };
      fetchAvailability();
    }
  }, [checkIn, checkOut]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const handleNext = () => {
    if (step === 1 && (!checkIn || !checkOut)) {
  return Swal.fire({
    icon: "warning",
    title: "Tanggal Belum Dipilih",
    text: "Silakan pilih tanggal check-in dan check-out terlebih dahulu.",
    confirmButtonColor: "#f59e0b",
  });
}
    if (step === 2 && selectedTents.length === 0) {
  return Swal.fire({
    icon: "warning",
    title: "Belum Ada Tenda",
    text: "Silakan pilih minimal satu tenda.",
    confirmButtonColor: "#f59e0b",
  });
}
    if (step < 3) setStep(step + 1);
  };

  const handleTentClick = (tentId: string) => {
    const isSelected = selectedTents.some((t: any) => t.tentId === tentId);
    if (isSelected) {
      // Deselect (Undo)
      setSelectedTents(selectedTents.filter((t: any) => t.tentId !== tentId));
    } else {
      // Select
      const pkg = packagesDB.find((p: any) => p.nama === activeTab);
      if (pkg) {
        setSelectedTents([...selectedTents, {
          tentId: tentId,
          paketId: pkg.id,
          namaPaket: pkg.nama,
          harga: pkg.harga
        }]);
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload = {
      check_in: checkIn,
      check_out: checkOut,
      items: selectedTents.map((t: any) => ({
        paket_id: t.paketId,
        nomor_tent: t.tentId
      })),
      total_harga: selectedTents.reduce((sum: number, t: any) => sum + t.harga, 0) * calculateNights()
    };

    try {
      const res = await fetch('http://localhost:6969/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await Swal.fire({
          icon: "success",
          title: "Pesanan Berhasil!",
          text: "Reservasi camping berhasil dibuat.",
          confirmButtonText: "Ke Dashboard",
          confirmButtonColor: "#059669",
        });

      router.push("/user/dashboard"); 
      } else {
        const errorData = await res.json();
        await Swal.fire({
          icon: "error",
          title: "Pemesanan Gagal",
          text: errorData.detail,
          confirmButtonColor: "#dc2626",
        });
      }
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Terjadi kesalahan pada server saat memproses pesanan.",
        confirmButtonColor: "#dc2626",
      });
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
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }} />
            
            {[
              { num: 1, icon: CalendarDays, label: "Tanggal" },
              { num: 2, icon: Tent, label: "Paket & Tenda" },
              { num: 3, icon: CheckCircle2, label: "Konfirmasi" }
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
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                <CalendarDays className="text-emerald-500"/> Pilih Tanggal Camping
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 custom-datepicker">
                <style>{`
                  .custom-datepicker .react-datepicker { border: none; border-radius: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); padding: 15px; font-family: inherit; }
                  .custom-datepicker .react-datepicker__header { background: white; border-bottom: none; padding-top: 10px; }
                  
                  /* Tanggal yang dipilih bulat */
                  .custom-datepicker .react-datepicker__day--selected { background-color: #059669 !important; border-radius: 50% !important; color: white !important; font-weight: bold; }
                  
                  /* Hari ini bulat */
                  .custom-datepicker .react-datepicker__day--today { border-radius: 50% !important; background-color: #f3f4f6; color: #1F6F5F ; font-weight: bold; }
                  
                  /* Hover tetap bulat */
                  .custom-datepicker .react-datepicker__day:hover { background-color: #d1fae5 !important; border-radius: 50% !important; }
                  .custom-datepicker .react-datepicker__day--keyboard-selected { background-color: #d1fae5 !important; border-radius: 50% !important; color: #059669; }
                  
                  .custom-datepicker .react-datepicker__current-month { font-weight: 800; color: #1c1917; margin-bottom: 15px; font-size: 1rem; }
                  .custom-datepicker .react-datepicker__day-name { color: #a8a29e; font-weight: bold; width: 2rem; }
                  .custom-datepicker .react-datepicker__day { width: 2rem; line-height: 2rem; }
                `}</style>
                
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-2">Tanggal Check-in</label>
                  <DatePicker
                    selected={checkIn ? new Date(checkIn + 'T00:00:00') : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const y = date.getFullYear();
                        const m = String(date.getMonth() + 1).padStart(2, '0');
                        const d = String(date.getDate()).padStart(2, '0');
                        setCheckIn(`${y}-${m}-${d}`);
                      } else {
                        setCheckIn("");
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    minDate={new Date()}
                    className="w-full p-4 bg-white border border-stone-200 text-stone-900 font-extrabold rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-2">Tanggal Check-out</label>
                  <DatePicker
                    selected={checkOut ? new Date(checkOut + 'T00:00:00') : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const y = date.getFullYear();
                        const m = String(date.getMonth() + 1).padStart(2, '0');
                        const d = String(date.getDate()).padStart(2, '0');
                        setCheckOut(`${y}-${m}-${d}`);
                      } else {
                        setCheckOut("");
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    minDate={checkIn ? new Date(checkIn + 'T00:00:00') : new Date()}
                    className="w-full p-4 bg-white border border-stone-200 text-stone-900 font-extrabold rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
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

          {/* PILIH PAKET & TENDA */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2"><Tent className="text-emerald-500"/> Pilih Paket & Tenda</h2>
                  <p className="text-stone-400 text-xs mt-1">Pilih kategori paket di bawah, lalu pilih tenda di peta. Anda bisa memilih banyak tenda.</p>
                </div>
                <div className="flex gap-4 text-xs font-bold text-stone-500 bg-stone-100 px-4 py-2 rounded-full self-end lg:self-auto">
                  <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-400 border border-white"></div> Tersedia</span>
                  <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-600 border border-white"></div> Terpilih</span>
                  <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div> Penuh</span>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-60"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>
              ) : (
                <div className="space-y-8">
                  {/* TAB & MAP (FULL WIDTH) */}
                  <div className="space-y-4 w-full">
                    {/* Tab Navigation (Button Style) */}
                    <div className="flex flex-wrap gap-3 pb-1">
                      {packagesDB.map((pkg) => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setActiveTab(pkg.nama)}
                          className={`px-5 py-2.5 rounded-full font-bold text-xs tracking-wider transition-all duration-300 shadow-sm border cursor-pointer ${
                            activeTab === pkg.nama
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                          }`}
                        >
                          PAKET {pkg.nama}
                        </button>
                      ))}
                    </div>

                    {/* Campground Map (Full Width) */}
                    <div className="relative w-full overflow-hidden rounded-3xl border-4 border-stone-200 shadow-inner bg-stone-900" style={{ aspectRatio: '16/10' }}>
                      <img 
                        src="/denah.jpg" 
                        alt="Denah Campground" 
                        className="absolute inset-0 w-full h-full object-cover opacity-90"
                      />

                      {/* TENT MARKERS */}
                      {tentCoordinates.map((tanda) => {
                        const isCurrentPackage = activeTab.charAt(0) === tanda.id.charAt(0);
                        const isBooked = bookedTents.includes(tanda.id);
                        const isSelected = selectedTents.some((t: any) => t.tentId === tanda.id);

                        // Tenda milik paket lain (ditampilkan redup dan tidak bisa diklik)
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
                            onClick={() => handleTentClick(tanda.id)}
                            style={{ top: tanda.top, left: tanda.left }}
                            title={`Tenda ${tanda.id} ${isBooked ? '(Penuh)' : isSelected ? '(Terpilih)' : '(Tersedia)'}`}
                            className={`
                              absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300
                              ${isSelected ? 'w-10 h-10 bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.8)] border-2 border-white scale-125 z-20 rounded-full' : 
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
                  </div>

                  {/* CART SUMMARY PANEL (BELOW THE MAP - FULL WIDTH) */}
                  <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 space-y-4 w-full">
                    <h3 className="font-extrabold text-stone-800 text-md tracking-tight flex items-center gap-2">
                      <Map size={18} className="text-emerald-500"/> Tenda Pilihan Anda
                    </h3>
                    <hr className="border-stone-200" />
                    
                    {selectedTents.length === 0 ? (
                      <div className="py-8 text-center text-stone-400 text-sm flex flex-col items-center gap-2">
                        <AlertCircle size={24} className="text-stone-300" />
                        <span>Belum ada tenda yang dipilih. Silakan pilih posisi tenda pada denah di atas.</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Grid layout for cart items */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                          {selectedTents.map((item) => (
                            <div key={item.tentId} className="flex justify-between items-center bg-white p-3 border border-stone-200 rounded-xl shadow-sm">
                              <div>
                                <p className="font-extrabold text-stone-800 text-sm">Tenda {item.tentId}</p>
                                <p className="text-stone-400 text-[10px] uppercase font-bold">Paket {item.namaPaket}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-emerald-600 text-xs">{formatRupiah(item.harga)}</span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedTents(selectedTents.filter((t: any) => t.tentId !== item.tentId))}
                                  className="text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg p-1.5 transition cursor-pointer"
                                  title="Batalkan pilihan"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Cart footer with total price details */}
                        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-stone-500">
                            <div>
                              <span>Subtotal / malam: </span>
                              <span className="text-stone-700 font-extrabold">{formatRupiah(selectedTents.reduce((sum: number, t: any) => sum + t.harga, 0))}</span>
                            </div>
                            <div>
                              <span>Durasi Stay: </span>
                              <span className="text-stone-700 font-extrabold">{calculateNights()} Malam</span>
                            </div>
                          </div>
                          
                          <div className="text-sm font-extrabold text-stone-900 border-t sm:border-t-0 sm:border-l sm:pl-6 border-stone-200 pt-2 sm:pt-0 flex justify-between sm:block gap-4">
                            <span>Estimasi Total: </span>
                            <span className="text-emerald-600 text-lg font-black ml-1">
                              {formatRupiah(selectedTents.reduce((sum: number, t: any) => sum + t.harga, 0) * calculateNights())}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* KONFIRMASI */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2"><CheckCircle2 className="text-emerald-500"/> Ringkasan Pesanan</h2>
              
              <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 mb-6 space-y-6">
                {/* Rentang Tanggal */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                  <div><p className="text-stone-500 mb-1 font-bold">Tanggal Check-in</p><p className="font-extrabold text-stone-900">{checkIn}</p></div>
                  <div><p className="text-stone-500 mb-1 font-bold">Tanggal Check-out</p><p className="font-extrabold text-stone-900">{checkOut}</p></div>
                  <div><p className="text-stone-500 mb-1 font-bold">Durasi Stay</p><p className="font-extrabold text-stone-900">{calculateNights()} Malam</p></div>
                </div>

                <hr className="border-stone-200" />

                {/* Daftar Tenda Detail */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Item Perkemahan</p>
                  {selectedTents.map((item) => (
                    <div key={item.tentId} className="flex justify-between items-center bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black">{item.tentId}</div>
                        <div>
                          <h4 className="font-extrabold text-stone-800 text-sm">Tenda {item.tentId}</h4>
                          <p className="text-stone-400 text-xs font-bold uppercase">Kategori: Paket {item.namaPaket}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-stone-900 text-sm">{formatRupiah(item.harga)} <span className="text-stone-400 text-xs font-normal">/ malam</span></p>
                        <p className="text-xs text-stone-400">Subtotal: {formatRupiah(item.harga * calculateNights())}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-stone-200" />

                {/* Total Billing */}
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-extrabold text-stone-800 text-lg">Total Pembayaran</h3>
                    <p className="text-stone-400 text-xs font-medium">Sudah mencakup semua sewa tenda pilihan Anda.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Tagihan</p>
                    <p className="text-3xl font-black text-emerald-600">
                      {formatRupiah(selectedTents.reduce((sum: number, t: any) => sum + t.harga, 0) * calculateNights())}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* NAV BUTTONS */}
        <div className="mt-8 flex justify-between">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : router.push('/user/dashboard')}
            className="flex items-center gap-2 px-6 py-3 text-stone-500 hover:text-stone-800 font-bold transition cursor-pointer"
          >
            <ChevronLeft size={20} /> {step === 1 ? 'Batal' : 'Kembali'}
          </button>
          
          {step < 3 ? (
            <button onClick={handleNext} className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-stone-900/20 transition cursor-pointer">
              Selanjutnya <ChevronRight size={20} />
            </button>
          ) : (
            <button disabled={isSubmitting} onClick={handleSubmit} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-full font-bold shadow-xl shadow-emerald-600/30 transition transform hover:scale-105 cursor-pointer">
              {isSubmitting ? 'Memproses...' : 'Buat Pesanan Sekarang'} <CheckCircle2 size={20} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}