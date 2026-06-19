"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, UploadCloud, CheckCircle2, Building, Image as ImageIcon, Copy } from 'lucide-react';

const bankOptions = [
  { id: 'bca', name: 'Bank BCA', acc: '1234 5678 9012', logo: 'BCA' },
  { id: 'mandiri', name: 'Bank Mandiri', acc: '0987 6543 2109', logo: 'MANDIRI' },
];

export default function PaymentPage() {
  const router = useRouter();
  
  const [orderToPay, setOrderToPay] = useState<any>(null);
  const [selectedBank, setSelectedBank] = useState(bankOptions[0]);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPendingBooking = async () => {
      try {
        const res = await fetch('http://localhost:6969/api/bookings', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const pending = data.bookings.find((o: any) => o.status_pemesanan === 'menunggu_pembayaran');
          if (pending) {
            setOrderToPay(pending);
          } else {
            alert("Tidak ada tagihan yang perlu dibayar.");
            router.push('/user/dashboard');
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPendingBooking();
  }, [router]);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedBank.acc.replace(/\s/g, ''));
    alert(`Nomor rekening ${selectedBank.name} berhasil disalin!`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Silakan unggah bukti transfer!");
    
    setIsSubmitting(true);
    
    // Gunakan FormData 
    const formData = new FormData();
    formData.append("bukti_tf", file);

    try {
      const res = await fetch(`http://localhost:6969/api/bookings/${orderToPay.pemesanan_id}/payment`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (res.ok) {
        alert("Bukti berhasil diunggah! Sedang menunggu verifikasi Admin.");
        router.push('/user/dashboard');
      } else {
        const err = await res.json();
        alert(`Gagal: ${err.detail}`);
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem saat mengunggah bukti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  if (!orderToPay) return null; 

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-3"><Wallet className="text-emerald-500" size={32} /> Pembayaran Pesanan</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="text-emerald-100 text-sm font-medium">Total Tagihan (ID: {orderToPay.pemesanan_id})</p>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase">{orderToPay.nomor_tent}</span>
              </div>
              <h2 className="text-4xl font-black">{formatRupiah(orderToPay.total_harga)}</h2>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><Building size={18} className="text-emerald-500"/> Pilih Bank Tujuan</h3>
              <div className="grid grid-cols-2 gap-3">
                {bankOptions.map((bank) => (
                  <button key={bank.id} onClick={() => setSelectedBank(bank)} className={`p-3 border-2 rounded-xl text-center ${selectedBank.id === bank.id ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200'}`}>
                    <p className={`font-black text-lg ${selectedBank.id === bank.id ? 'text-emerald-700' : 'text-stone-600'}`}>{bank.logo}</p>
                  </button>
                ))}
              </div>
              <div className="mt-6 p-5 bg-stone-50 border border-stone-200 rounded-2xl">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Transfer ke {selectedBank.name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-stone-900 font-mono tracking-wider">{selectedBank.acc}</p>
                  <button onClick={handleCopy} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"><Copy size={18} /></button>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-stone-200 flex flex-col h-full">
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><UploadCloud size={18} className="text-emerald-500"/> Unggah Bukti Transfer</h3>
            <div className="flex-1 border-2 border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden min-h-[250px]">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><CheckCircle2 size={32} /></div>
                  <p className="font-bold text-stone-800 text-sm">{file.name}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center"><ImageIcon size={32} /></div>
                  <p className="font-bold text-stone-700 text-sm">Klik atau seret struk ke sini</p>
                </div>
              )}
            </div>
            <button type="submit" disabled={isSubmitting} className={`mt-6 w-full py-4 rounded-xl font-bold shadow-md ${isSubmitting ? 'bg-stone-200 text-stone-400' : 'bg-stone-900 text-white'}`}>
              {isSubmitting ? 'Mengirim Data...' : 'Konfirmasi Telah Bayar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}