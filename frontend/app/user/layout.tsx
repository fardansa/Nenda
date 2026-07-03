"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Tent, Clock, LogOut, Bell, User } from 'lucide-react';


export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
  try {
    const res = await fetch("http://localhost:6969/api/notifikasi", {
      credentials: "include",
    });

    if (!res.ok) return;

    const data = await res.json();
    setNotifications(data.notifications || []);
  } catch (err) {
    console.error("Fetch notification error:", err);
  }
};

useEffect(() => {
  fetchNotifications();

  const interval = setInterval(fetchNotifications, 10000);

  return () => clearInterval(interval);
}, []);

const unreadCount = notifications.filter(
  (n) => !n.is_read
).length;

     useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target as Node)
    ) {
      setShowNotifications(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () =>
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
}, []);

const handleNotificationClick = async (notification: any) => {
  try {
    if (!notification.is_read) {
      await fetch(
        `http://localhost:6969/api/notifikasi/${notification.notifikasi_id}/read`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item.notifikasi_id === notification.notifikasi_id
            ? { ...item, is_read: true }
            : item
        )
      );
    }

    setShowNotifications(false);

    router.push("/user/dashboard");

  } catch (err) {
    console.error("Notification click error:", err);
  }
};

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
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full transition relative"
              >
                <Bell size={18} />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-[420px] bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden z-50">

                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50">
                    <h2 className="text-lg font-bold text-stone-800">
                      Notifikasi
                    </h2>

                    <span className="text-xs font-medium text-stone-500">
                      {notifications.length} Notifikasi
                    </span>
                  </div>

                  {/* Empty */}
                  {notifications.length === 0 ? (
                    <div className="py-12 px-6 text-center">

                      <Bell
                        size={38}
                        className="mx-auto text-stone-300"
                      />

                      <p className="mt-4 font-semibold text-stone-700">
                        Belum ada notifikasi
                      </p>

                      <p className="text-sm text-stone-500 mt-1">
                        Semua pemberitahuan akan muncul di sini.
                      </p>

                    </div>
                  ) : (

                    <div className="max-h-[450px] overflow-y-auto">

                      {notifications.map((notification: any) => {

                        const isRejected =
                          notification.judul.toLowerCase().includes("ditolak") ||
                          notification.pesan.toLowerCase().includes("ditolak");

                        const isAccepted =
                          notification.judul.toLowerCase().includes("dibayar") ||
                          notification.pesan.toLowerCase().includes("dibayar");

                        return (

                          <div
                            key={notification.notifikasi_id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`px-5 py-4 border-b border-stone-100 transition hover:bg-stone-50 cursor-pointer ${
                              !notification.is_read
                                ? "bg-emerald-50/40 border-l-4 border-l-emerald-500"
                                : ""
                            }`}
                          >

                            <div className="flex items-start justify-between gap-3">

                              <div className="flex-1">

                                <div className="flex items-center gap-2">

                                  <span
                                    className={`w-2.5 h-2.5 rounded-full ${
                                      isRejected
                                        ? "bg-red-500"
                                        : isAccepted
                                        ? "bg-emerald-500"
                                        : "bg-amber-500"
                                    }`}
                                  />

                                  <h3 className="font-bold text-stone-800">
                                    {notification.judul}
                                  </h3>

                                </div>

                                <p className="mt-2 text-sm leading-6 text-stone-600">
                                  {notification.pesan}
                                </p>

                                <p className="mt-3 text-xs text-stone-400">
                                  {new Date(notification.created_at).toLocaleString("id-ID", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })}
                                </p>

                              </div>

                              {!notification.is_read && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                              )}

                            </div>

                          </div>

                        );

                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
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