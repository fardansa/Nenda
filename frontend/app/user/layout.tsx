"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Tent, Clock, LogOut, Bell, User } from 'lucide-react';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:6969/api/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
    } catch (err) {
      console.error('Logout error', err);
    }
    localStorage.removeItem('role');
    router.push('/');
  };

  return (
    <div className="min-h-screen flex bg-stone-50 font-sans">
      {/* SIDEBAR USER */}
      <aside className="w-64 bg-stone-950 text-white flex flex-col fixed h-full border-r border-stone-800 z-30">
        <div className="h-20 flex items-center px-6 border-b border-stone-800">
          <Link href="/" className="text-2xl font-extrabold text-emerald-400 tracking-tighter hover:text-emerald-300 transition">
            Nenda<span className="text-white">.</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/user/dashboard" className="flex items-center gap-3 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold shadow-md transition-all">
            <LayoutDashboard size={18} /><span>Dashboard Saya</span>
          </Link>
          <Link href="/user/book" className="flex items-center gap-3 px-4 py-3 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition font-semibold">
            <Tent size={18} /><span>Pesan Tenda Baru</span>
          </Link>
          <Link href="/user/dashboard" className="flex items-center gap-3 px-4 py-3 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition font-semibold">
            <Clock size={18} /><span>Riwayat Transaksi</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-stone-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-bold transition">
            <LogOut size={18} /><span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-20 bg-white border-b border-stone-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="text-stone-500 font-medium text-sm">Dashboard Pelanggan</div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full transition relative">
              <Bell size={18} />
            </button>
            <div className="h-8 w-px bg-stone-200" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-stone-800">Halo, Petualang!</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <User size={20} />
              </div>
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