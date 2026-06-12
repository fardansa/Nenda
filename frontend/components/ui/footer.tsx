import Link from 'next/link';
// Hapus Instagram, Facebook, Twitter dari lucide-react
import { Tent, MapPin, Phone, Mail } from 'lucide-react';
// Import ikon brand dari react-icons/fa yang sudah terbukti aman
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-400 py-16 font-sans border-t border-stone-900">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        
        {/* Kolom 1: Brand & Deskripsi */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 text-white font-extrabold text-2xl tracking-tighter">
            <Tent className="text-emerald-500" size={28} />
            Nenda<span className="text-emerald-500">.</span>
          </Link>
          <p className="text-sm text-stone-500 leading-relaxed max-w-xs">
            Sistem reservasi perkemahan yang memudahkanmu menemukan tenda terbaik. Nikmati petualangan alam dengan fasilitas premium.
          </p>
        </div>

        {/* Kolom 2: Tautan Cepat */}
        <div>
          <h3 className="text-white font-bold mb-5 uppercase tracking-wider text-sm">Eksplorasi</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/" className="hover:text-emerald-400 transition">Beranda</Link></li>
            <li><Link href="/#katalog" className="hover:text-emerald-400 transition">Katalog Tenda</Link></li>
            <li><Link href="#" className="hover:text-emerald-400 transition">Fasilitas Camp</Link></li>
            <li><Link href="/login" className="hover:text-emerald-400 transition">Masuk Akun</Link></li>
          </ul>
        </div>

        {/* Kolom 3: Kontak */}
        <div>
          <h3 className="text-white font-bold mb-5 uppercase tracking-wider text-sm">Hubungi Kami</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-emerald-500 shrink-0 mt-0.5" /> 
              <span>Jakarta, Indonesia</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-emerald-500 shrink-0" /> 
              <span>+62 812 3456 7890</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-emerald-500 shrink-0" /> 
              <span>hello@nenda.com</span>
            </li>
          </ul>
        </div>

        {/* Kolom 4: Sosial Media */}
        <div>
          <h3 className="text-white font-bold mb-5 uppercase tracking-wider text-sm">Sosial Media</h3>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-500 hover:text-white transition-all">
              <FaInstagram size={18} />
            </a>
            <a href="#" className="w-10 h-10 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-500 hover:text-white transition-all">
              <FaFacebook size={18} />
            </a>
            <a href="#" className="w-10 h-10 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-500 hover:text-white transition-all">
              <FaTwitter size={18} />
            </a>
          </div>
        </div>

      </div>

      {/* Baris Bawah: Copyright & Tim Pengembang */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} Nenda Campground. Hak cipta dilindungi.</p>
      </div>
    </footer>
  );
}