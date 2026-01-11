"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";
import { useState } from "react";

import {
  Home,
  Calendar,
  HeartPulse,
  MessageCircle,
  User,
  Users,
  Settings,
  Shield,
  Activity,
  Utensils,
} from "lucide-react";

type TabItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

/* ---------------------------------
   TABBAR – 5 VALG (KUN KUNDE)
---------------------------------- */

// 🔹 KUNDE – 5 tabs (Smerte i midten)
const clientTabs: TabItem[] = [
  { label: "Hjem", href: "/dashboard", icon: Home },
  { label: "Kalender", href: "/calendar", icon: Calendar },

  // ❤️ FOKUS (MIDTEN)
  { label: "Smerte", href: "/pain", icon: HeartPulse },

  { label: "Meldinger", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

// Trener – uendret
const trainerTabs: TabItem[] = [
  { label: "Hjem", href: "/dashboard", icon: Home },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Meld.", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

// Admin – uendret
const adminTabs: TabItem[] = [
  { label: "Admin", href: "/dashboard", icon: Shield },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Trenere", href: "/trainers", icon: Users },
  { label: "Meld.", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
  { label: "Innst.", href: "/settings", icon: Settings },
];

/* ---------------------------------
   KOMPONENT
---------------------------------- */

export default function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, loading } = useRole();

  const [showPainMenu, setShowPainMenu] = useState(false);
  let pressTimer: NodeJS.Timeout;

  if (loading || !role) return null;

  const items =
    role === "client"
      ? clientTabs
      : role === "trainer"
      ? trainerTabs
      : adminTabs;

  /* -------------------------------
     LONG PRESS HANDLERS (KUN KUNDE)
  -------------------------------- */

  const handlePainPressStart = () => {
    pressTimer = setTimeout(() => {
      setShowPainMenu(true);
    }, 450); // ⏱ long-press delay
  };

  const handlePainPressEnd = () => {
    clearTimeout(pressTimer);
  };

  return (
    <>
      {/* ---------------- TABBAR ---------------- */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-sf-border md:hidden">
        <ul className="flex items-center justify-between px-2">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            const isPainTab =
              role === "client" && item.href === "/pain";

            return (
              <li key={item.href} className="flex-1">
                {isPainTab ? (
                  <button
                    onClick={() => router.push("/pain")}
                    onTouchStart={handlePainPressStart}
                    onTouchEnd={handlePainPressEnd}
                    onMouseDown={handlePainPressStart}
                    onMouseUp={handlePainPressEnd}
                    className={`flex w-full flex-col items-center justify-center py-2 gap-0.5 transition ${
                      isActive
                        ? "text-[#007C80]"
                        : "text-slate-500"
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="text-[10px] leading-none">
                      {item.label}
                    </span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex flex-col items-center justify-center py-2 gap-0.5 transition ${
                      isActive
                        ? "text-[#007C80]"
                        : "text-slate-500"
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.6} />
                    <span className="text-[10px] leading-none">
                      {item.label}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* --------- LONG-PRESS MENY (KUNDE) --------- */}
      {role === "client" && showPainMenu && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30"
          onClick={() => setShowPainMenu(false)}
        >
          <div
            className="mb-20 w-[90%] max-w-sm rounded-2xl bg-white shadow-xl border border-sf-border p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 text-xs text-sf-muted text-center">
              Velg fokus
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowPainMenu(false);
                  router.push("/tests");
                }}
                className="flex flex-col items-center gap-2 rounded-xl border border-sf-border p-4 hover:bg-sf-soft transition"
              >
                <Activity size={20} />
                <span className="text-sm font-medium">Tester</span>
              </button>

              <button
                onClick={() => {
                  setShowPainMenu(false);
                  router.push("/nutrition");
                }}
                className="flex flex-col items-center gap-2 rounded-xl border border-sf-border p-4 hover:bg-sf-soft transition"
              >
                <Utensils size={20} />
                <span className="text-sm font-medium">Kosthold</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}