"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Inspektoeren from "@/components/Inspektoeren";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Brugere", href: "/admin/users" },
  { label: "Email liste", href: "/admin/email-list" },
  { label: "Emails", href: "/admin/emails" },
  { label: "Indbakke", href: "/admin/inbox", badge: true },
  { label: "Forslag", href: "/admin/suggestions" },
  { label: "Betalinger", href: "/admin/payments" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch("/api/admin/inbox");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {
        // silently fail
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh count when navigating to inbox
  useEffect(() => {
    if (pathname === "/admin/inbox") {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch("/api/admin/inbox");
          if (res.ok) {
            const data = await res.json();
            setUnreadCount(data.unreadCount || 0);
          }
        } catch {
          // silently fail
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin-login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1C2B2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Inspektoeren pose="searching" size={36} />
              <h1 className="text-lg font-bold text-white">
                <span>Abo</span>
                <span className="text-[#4ECDC4]">Vagt</span>{" "}
                <span className="text-white/60 font-normal">Admin</span>
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Log ud
            </button>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-[#1C2B2A]/90 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    isActive
                      ? "text-[#4ECDC4] border-[#4ECDC4]"
                      : "text-white/60 border-transparent hover:text-white hover:border-white/30"
                  }`}
                >
                  {item.label}
                  {item.badge && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
