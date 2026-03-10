"use client";

import { usePathname, useRouter } from "next/navigation";
import Inspektoeren from "@/components/Inspektoeren";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Brugere", href: "/admin/users" },
  { label: "Emails", href: "/admin/emails" },
  { label: "Forslag", href: "/admin/suggestions" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

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
                  className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    isActive
                      ? "text-[#4ECDC4] border-[#4ECDC4]"
                      : "text-white/60 border-transparent hover:text-white hover:border-white/30"
                  }`}
                >
                  {item.label}
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
