"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, UploadCloud, CheckCircle2, Building, Image as ImageIcon, Copy, CreditCard } from 'lucide-react';

// Data simulasi Bank
const bankOptions = [
  { id: 'bca', name: 'Bank BCA', acc: '1234 5678 9012', logo: 'BCA' },
  { id: 'mandiri', name: 'Bank Mandiri', acc: '0987 6543 2109', logo: 'MANDIRI' },
  { id: 'bri', name: 'Bank BRI', acc: '1122 3344 5566', logo: 'BRI' },
];

export default function PaymentPage() {
  const router = useRouter();
  
  const [orderToPay, setOrderToPay] = useState<any>(null);
  const [selectedBank, setSelectedBank] = useState(bankOptions[0]);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('nenda_orders') || '[]');
    const pendingOrder = savedOrders.find((o: any) => o.status === 'menunggu_pembayaran');
    
    if (pendingOrder) {
      setOrderToPay(pendingOrder);
    } else {
      alert("Tidak ada tagihan yang perlu dibayar saat ini.");
      router.push('/user/dashboard');
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Silakan unggah bukti transfer terlebih dahulu!");
    
    setIsSubmitting(true);
    
    // Prosedur upload & update database (localStorage)
    setTimeout(() => {
      const savedOrders = JSON.parse(localStorage.getItem('nenda_orders') || '[]');
      
      const updatedOrders = savedOrders.map((o: any) => 
        o.id === orderToPay.id ? { ...o, status: 'menunggu_verifikasi' } : o
      );
      
      localStorage.setItem('nenda_orders', JSON.stringify(updatedOrders));
      
      setIsSubmitting(false);
      alert("Pesanan Telah Dibayar! Bukti berhasil diunggah dan sedang menunggu verifikasi Admin.");
      router.push('/user/dashboard');
    }, 1500);
  };

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  if (!orderToPay) return null; 

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-3">
            <Wallet className="text-emerald-500" size={32} /> Pembayaran Pesanan
          </h1>
          <p className="text-stone-500 text-sm mt-1">Pilih metode pembayaran, lakukan transfer, dan unggah buktinya.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            
            {/* Total Tagihan */}
            <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg shadow-emerald-600/20">
              <div className="flex justify-between items-start mb-2">
                <p className="text-emerald-100 text-sm font-medium">Total Tagihan (ID: {orderToPay.id})</p>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-widest uppercase">{orderToPay.tenda}</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight">{formatRupiah(orderToPay.total)}</h2>
            </div>

            {/* Pilihan Bank */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Building size={18} className="text-emerald-500"/> Pilih Bank Tujuan
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {bankOptions.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBank(bank)}
                    className={`p-3 border-2 rounded-xl text-center transition-all ${
                      selectedBank.id === bank.id 
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                      : 'border-stone-200 hover:border-emerald-200 hover:bg-stone-50'
                    }`}
                  >
                    <p className={`font-black text-lg ${selectedBank.id === bank.id ? 'text-emerald-700' : 'text-stone-600'}`}>
                      {bank.logo}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-5 bg-stone-50 border border-stone-200 rounded-2xl">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Transfer ke {selectedBank.name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-stone-900 font-mono tracking-wider">{selectedBank.acc}</p>
                  <button onClick={handleCopy} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition" title="Salin Rekening">
                    <Copy size={18} />
                  </button>
                </div>
                <p className="text-sm text-stone-500 mt-2">A.n. Nenda Campground</p>
              </div>
            </div>

          </div>

          {/* FORM UNGGAH BUKTI */}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col h-full">
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <UploadCloud size={18} className="text-emerald-500"/> Unggah Bukti Transfer
            </h3>
            
            <div className="flex-1 border-2 border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center p-8 text-center hover:bg-stone-50 transition relative overflow-hidden group min-h-[250px]">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 text-sm truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-emerald-600 font-bold mt-1">Bukti Siap Dikirim</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center group-hover:bg-stone-200 group-hover:text-emerald-500 transition-colors">
                    <ImageIcon size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-stone-700 text-sm">Klik atau seret struk ke sini</p>
                    <p className="text-xs text-stone-500 mt-1">Mendukung format JPG, PNG (Maks 2MB)</p>
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`mt-6 w-full py-4 rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 text-lg
                ${isSubmitting ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-stone-900 hover:bg-stone-800 text-white hover:shadow-xl hover:shadow-stone-900/30'}
              `}
            >
              {isSubmitting ? 'Mengirim Data...' : 'Konfirmasi Telah Bayar'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}