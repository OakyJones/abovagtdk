"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Inspektoeren from "@/components/Inspektoeren";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Brugere", href: "/admin/users" },
  { label: "Email liste", href: "/admin/email-list" },
  { label: "Emails", href: "/admin/emails" },
  { label: "Indbakke", href: "/admin/inbox", badge: "inbox" as const },
  { label: "Chat", href: "/admin/chat", badge: "chat" as const },
  { label: "Forslag", href: "/admin/suggestions" },
  { label: "Betalinger", href: "/admin/payments" },
  { label: "Email Test", href: "/admin/email-test" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnread, setChatUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Body scroll lock when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const [inboxRes, chatRes] = await Promise.all([
          fetch("/api/admin/inbox"),
          fetch("/api/admin/chat"),
        ]);
        if (inboxRes.ok) {
          const data = await inboxRes.json();
          setUnreadCount(data.unreadCount || 0);
        }
        if (chatRes.ok) {
          const data = await chatRes.json();
          const unread = (data.messages || []).filter(
            (m: { sender: string; read_by_mik: boolean }) => m.sender === "mik" && !m.read_by_mik
          ).length;
          setChatUnread(unread);
        }
      } catch {
        // silently fail
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh counts when navigating to inbox or chat
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
    if (pathname === "/admin/chat") {
      setChatUnread(0);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin-login");
  };

  const getBadgeCount = (badge?: string) => {
    if (badge === "inbox") return unreadCount;
    if (badge === "chat") return chatUnread;
    return 0;
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="text-sm text-white/60 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                Log ud
              </button>
              {/* Hamburger — mobile only */}
              <button
                className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-white text-xl"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Luk menu" : "Åbn menu"}
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Nav */}
      <nav className="hidden md:block bg-[#1C2B2A]/90 border-b border-white/10">
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
                  className={`relative px-4 py-3 text-sm font-medium transition-colors border-b-2 min-h-[44px] flex items-center ${
                    isActive
                      ? "text-[#4ECDC4] border-[#4ECDC4]"
                      : "text-white/60 border-transparent hover:text-white hover:border-white/30"
                  }`}
                >
                  {item.label}
                  {item.badge === "inbox" && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  {item.badge === "chat" && chatUnread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[#4ECDC4] text-[#1C2B2A] text-[10px] font-bold rounded-full px-1">
                      {chatUnread > 99 ? "99+" : chatUnread}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#1C2B2A] flex flex-col items-center justify-center gap-2">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-white text-2xl"
            onClick={() => setMenuOpen(false)}
            aria-label="Luk menu"
          >
            ✕
          </button>

          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const count = getBadgeCount(item.badge);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`min-h-[44px] px-6 py-3 text-lg font-medium transition-colors flex items-center gap-3 ${
                  isActive ? "text-[#4ECDC4]" : "text-white hover:text-[#4ECDC4]"
                }`}
              >
                {item.label}
                {count > 0 && (
                  <span className={`min-w-[22px] h-[22px] flex items-center justify-center text-[11px] font-bold rounded-full px-1.5 ${
                    item.badge === "inbox"
                      ? "bg-red-500 text-white"
                      : "bg-[#4ECDC4] text-[#1C2B2A]"
                  }`}>
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </a>
            );
          })}

          <button
            onClick={() => { setMenuOpen(false); handleLogout(); }}
            className="mt-6 min-h-[44px] px-6 py-3 text-lg text-white/40 hover:text-white transition-colors"
          >
            Log ud
          </button>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
