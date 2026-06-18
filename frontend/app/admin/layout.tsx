"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Tent, Users, CreditCard, LogOut, Bell, Settings, Loader } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Untuk mendeteksi halaman mana yang sedang aktif
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:6969/api/user', {
          credentials: 'include'
        });
        if (res.ok) {
          const user = await res.json();
          if (user && user.role === 'admin') {
            setAuthorized(true);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
      localStorage.removeItem('role');
      router.push('/login');
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:6969/api/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error', err);
    }
    localStorage.removeItem('role');
    router.push('/');
  };

  const navLinks = [
    { name: "Status Tenda", href: "/admin/tents", icon: <Tent size={18} /> },
    { name: "Verifikasi Pembayaran", href: "/admin/utilities", icon: <CreditCard size={18} /> },
    { name: "Data Pelanggan", href: "/admin/users", icon: <Users size={18} /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-white flex-col gap-4">
        <Loader className="animate-spin text-emerald-500" size={40} />
        <p className="text-sm font-semibold tracking-wider uppercase text-stone-400">Memverifikasi Otoritas Admin...</p>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen flex bg-stone-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-stone-900 text-white flex flex-col fixed h-full border-r border-stone-800 z-30">
        <div className="h-20 flex items-center px-6 border-b border-stone-800">
          <span className="text-2xl font-extrabold text-emerald-400 tracking-tighter">Nenda<span className="text-white">.Admin</span></span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                  isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-stone-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-bold transition">
            <LogOut size={18} /><span>Keluar Panel</span>
          </button>
        </div>
      </aside>

      {/* HEADER & MAIN CONTENT */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-20 bg-white border-b border-stone-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="text-stone-500 font-medium text-sm">Sistem Reservasi Camping Nenda</div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full transition relative">
              <Bell size={18} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>
            <div className="h-8 w-px bg-stone-200" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-stone-800">Administrator</p>
              </div>
              <img src="https://ui-avatars.com/api/?name=Admin&background=047857&color=fff" alt="Profile" className="w-10 h-10 rounded-full border" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}