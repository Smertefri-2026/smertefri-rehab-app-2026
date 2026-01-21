"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";
import { useEffect, useRef, useState } from "react";

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
  { label: "Smerte", href: "/pain", icon: HeartPulse }, // ❤️ MIDTEN
  { label: "Meldinger", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

// Trener
const trainerTabs: TabItem[] = [
  { label: "Hjem", href: "/dashboard", icon: Home },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Meld.", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

// Admin
const adminTabs: TabItem[] = [
  { label: "Admin", href: "/dashboard", icon: Shield },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Trenere", href: "/trainers", icon: Users },
  { label: "Meld.", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
  { label: "Innst.", href: "/settings", icon: Settings },
];

export default function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, loading } = useRole();

  const [showPainMenu, setShowPainMenu] = useState(false);

  // ✅ Stabil timer + “long-press skjedde” flag
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);

  // Litt romsligere long-press (så tap ikke blir “uhell”)
  const LONG_PRESS_MS = 700;

  if (loading || !role) return null;

  const items =
    role === "client" ? clientTabs : role === "trainer" ? trainerTabs : adminTabs;

  const clearPressTimer = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handlePainPressStart = () => {
    longPressedRef.current = false;
    clearPressTimer();

    pressTimerRef.current = setTimeout(() => {
      longPressedRef.current = true; // ✅ marker at long-press faktisk skjedde
      setShowPainMenu(true);
    }, LONG_PRESS_MS);
  };

  const handlePainPressEnd = () => {
    // Hvis user bare tapper: vi rydder timer før den fyrer
    clearPressTimer();
  };

  // Hvis menyen er åpen og du navigerer, lukk den
  useEffect(() => {
    if (!showPainMenu) return;
    // Optional: lukk om route endres
  }, [showPainMenu]);

  return (
    <>
      {/* ---------------- TABBAR ---------------- */}
      <nav
        className="
          fixed bottom-0 left-0 right-0 z-50 md:hidden
          border-t border-sf-border bg-white/95 backdrop-blur
          pb-[env(safe-area-inset-bottom)]
        "
        style={{
          // Litt mer “FB-feel” i høyde/touch-area
          // (ul + li har også padding)
          minHeight: 72,
        }}
      >
        <ul className="flex items-stretch justify-between px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const isPainTab = role === "client" && item.href === "/pain";

            const baseClass = `flex w-full flex-col items-center justify-center
              py-3 gap-1 transition select-none
              ${isActive ? "text-[#007C80]" : "text-slate-500"}`;

            if (isPainTab) {
              return (
                <li key={item.href} className="flex-1">
                  <button
                    type="button"
                    // ✅ Pointer events dekker både touch + mouse ryddig
                    onPointerDown={handlePainPressStart}
                    onPointerUp={handlePainPressEnd}
                    onPointerCancel={handlePainPressEnd}
                    onPointerLeave={handlePainPressEnd}
                    onPointerMove={handlePainPressEnd} // hvis du drar litt – cancel long-press
                    onClick={() => {
                      // ✅ Hvis long-press åpnet meny: ikke naviger på click
                      if (longPressedRef.current) {
                        longPressedRef.current = false;
                        return;
                      }
                      router.push("/pain");
                    }}
                    className={baseClass}
                  >
                    <Icon size={24} strokeWidth={isActive ? 2.6 : 2.0} />
                    <span className="text-[11px] leading-none">{item.label}</span>
                  </button>
                </li>
              );
            }

            return (
              <li key={item.href} className="flex-1">
                <Link href={item.href} className={baseClass}>
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
                  <span className="text-[11px] leading-none">{item.label}</span>
                </Link>
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
            className="mb-24 w-[92%] max-w-sm rounded-2xl bg-white shadow-xl border border-sf-border p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 text-xs text-sf-muted text-center">Velg fokus</p>

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

            <button
              onClick={() => setShowPainMenu(false)}
              className="mt-4 w-full rounded-xl border border-sf-border py-2 text-sm text-sf-muted hover:bg-sf-soft"
            >
              Lukk
            </button>
          </div>
        </div>
      )}
    </>
  );
}