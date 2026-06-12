"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Tent } from 'lucide-react';
import { FaInstagram, FaLinkedin, FaFacebook } from 'react-icons/fa';

export default function RegisterPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const leftSection = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - leftSection.left, y: e.clientY - leftSection.top });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Memanggil API Register dari FastAPI
      const response = await fetch('http://localhost:6969/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: name, email: email, password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Terjadi kesalahan saat mendaftar');
      }

      // Jika sukses, arahkan ke halaman login
      router.push('/login');
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const socialIcons = [
    { icon: <FaInstagram size={20} />, href: '#' },
    { icon: <FaLinkedin size={20} />, href: '#' },
    { icon: <FaFacebook size={20} />, href: '#' }
  ];

  return (
    <div className="min-h-screen w-full bg-stone-950 flex items-center justify-center p-4">
      <Link href="/" className="absolute top-6 left-6 text-stone-400 hover:text-emerald-400 flex items-center gap-2 transition font-bold z-50">
        <Tent size={24} /> Nenda.
      </Link>

      <div className='card w-full max-w-5xl flex flex-col md:flex-row min-h-[650px] md:h-[650px] rounded-2xl overflow-hidden shadow-2xl border border-stone-800 relative bg-stone-900'>
        
        {/* Sisi Kiri: GAMBAR CAMPGROUND TENDA (Sama persis dengan halaman Login agar 100% aman ke-load) */}
        <div className='w-full md:w-1/2 h-64 md:h-full overflow-hidden bg-stone-950 relative z-10 border-b md:border-b-0 md:border-r border-stone-800'>
          <img 
            src='https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1280&auto=format&fit=crop' 
            alt="Scenic mountain campground" 
            className="w-full h-full object-cover transition-transform duration-700 opacity-70 hover:opacity-100 hover:scale-105" 
          />
        </div>
        
        <div className='w-full md:w-1/2 px-8 py-10 md:px-12 flex flex-col justify-center relative overflow-hidden z-0' onMouseMove={handleMouseMove} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
          <div className={`absolute pointer-events-none w-[500px] h-[500px] bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 rounded-full blur-3xl transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`} style={{ transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`, transition: 'transform 0.1s ease-out' }} />

          <div className="z-10 relative flex flex-col justify-center">
            <form className='text-center grid gap-2' onSubmit={handleRegister}>
              <div className='grid gap-4 mb-4 relative z-10'>
                <h1 className='text-4xl font-extrabold text-white tracking-tight'>Daftar Akun</h1>
                <div className="flex items-center justify-center mt-2 relative z-10">
                  <ul className="flex gap-4">
                    {socialIcons.map((social, idx) => (
                      <li key={idx} className="list-none">
                        <a href={social.href} className="w-12 h-12 bg-stone-950 rounded-full flex justify-center items-center relative z-[1] border border-stone-700 overflow-hidden group">
                          <div className="absolute inset-0 w-full h-full bg-emerald-600 scale-y-0 origin-bottom transition-transform duration-500 ease-in-out group-hover:scale-y-100" />
                          <span className="text-stone-400 transition-all duration-500 ease-in-out z-[2] group-hover:text-white">{social.icon}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <span className='text-sm text-stone-500 relative z-10'>atau daftar dengan email</span>
              </div>

              {errorMessage && <div className="text-red-400 text-sm font-medium z-10">{errorMessage}</div>}

              <div className='grid gap-4 items-center mb-6 relative z-10 mt-2'>
                <input placeholder="Nama Lengkap" type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-800 text-white focus:border-emerald-500 outline-none transition" />
                <input placeholder="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-800 text-white focus:border-emerald-500 outline-none transition" />
                <div className="relative">
                  <input placeholder="Password" type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-800 text-white focus:border-emerald-500 outline-none transition pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-emerald-400 transition cursor-pointer">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>

              <div className='flex justify-center relative z-10'>
                <button type="submit" disabled={isLoading} className="group relative inline-flex w-full justify-center items-center overflow-hidden rounded-xl bg-stone-800 border border-stone-700 px-8 py-3 text-sm font-bold text-white hover:border-emerald-500 disabled:opacity-50 cursor-pointer">
                  <span className="relative z-10 text-emerald-400 group-hover:text-white transition-colors">{isLoading ? "Memproses..." : "Daftar Sekarang"}</span>
                  <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-13deg)_translateX(150%)]"><div className="relative h-full w-12 bg-white/10" /></div>
                </button>
              </div>

              <div className="text-sm text-stone-400 mt-4 z-10 relative">Sudah punya akun? <Link href="/login" className="text-emerald-400 font-bold hover:underline">Masuk di sini</Link></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}