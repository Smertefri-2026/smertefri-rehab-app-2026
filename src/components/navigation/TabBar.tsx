// /Users/oystein/smertefri-rehab-app-2026/src/components/navigation/TabBar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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

// 🔹 KUNDE
const clientTabs: TabItem[] = [
  { label: "Hjem", href: "/dashboard", icon: Home },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Smerte", href: "/pain", icon: HeartPulse },
  { label: "Meldinger", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

// 🔹 Trener
const trainerTabs: TabItem[] = [
  { label: "Hjem", href: "/dashboard", icon: Home },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Meld.", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

// 🔹 Admin
const adminTabs: TabItem[] = [
  { label: "Admin", href: "/dashboard", icon: Shield },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Trenere", href: "/trainers", icon: Users },
  { label: "Meld.", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
  { label: "Innst.", href: "/settings", icon: Settings },
];

async function fetchUnreadThreadCount(): Promise<number> {
  // Viktig: hvis session ikke finnes enda => auth.uid() blir null i DB
  const { data: s } = await supabase.auth.getSession();
  if (!s.session) return 0;

  const { data, error } = await supabase.rpc("chat_unread_thread_count");

  if (error) {
    console.error("chat_unread_thread_count RPC error:", error);
    return 0;
  }

  return typeof data === "number" ? data : 0;
}

function DotBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      className="
        absolute -top-1 -right-1
        h-2.5 w-2.5
        rounded-full bg-[#D45151]
        border-2 border-white
      "
      aria-label="Uleste meldinger"
    />
  );
}

export default function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, loading } = useRole();

  const [showPainMenu, setShowPainMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);
  const LONG_PRESS_MS = 700;

  useEffect(() => {
    if (loading) return;

    let alive = true;

    const refresh = async () => {
      const n = await fetchUnreadThreadCount();
      if (alive) setUnreadCount(n);
    };

    // Første fetch
    refresh();

    // Fokus/visibility (mobil!)
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    // Manuell signal (fra markRead / threadlist click)
    const onUnreadChanged = () => refresh();
    window.addEventListener("chat-unread-changed", onUnreadChanged);

    // Realtime triggers
    const channel = supabase
      .channel("nav-unread-tabbar")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () =>
        refresh()
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_thread_reads" }, () =>
        refresh()
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_thread_reads" }, () =>
        refresh()
      )
      .subscribe();

    // ✅ Fallback polling
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 1500);

    return () => {
      alive = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("chat-unread-changed", onUnreadChanged);
      supabase.removeChannel(channel);
    };
  }, [loading]);

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
      longPressedRef.current = true;
      setShowPainMenu(true);
    }, LONG_PRESS_MS);
  };

  const handlePainPressEnd = () => clearPressTimer();

  return (
    <>
      <nav
        className="
          fixed bottom-0 left-0 right-0 z-50 md:hidden
          border-t border-sf-border bg-white/95 backdrop-blur
          pb-[env(safe-area-inset-bottom)]
        "
        style={{ minHeight: 72 }}
      >
        <ul className="flex items-stretch justify-between px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const isPainTab = role === "client" && item.href === "/pain";
            const isChatTab = item.href === "/chat";

            const baseClass = `flex w-full flex-col items-center justify-center
              py-3 gap-1 transition select-none
              ${isActive ? "text-[#007C80]" : "text-slate-500"}`;

            if (isPainTab) {
              return (
                <li key={item.href} className="flex-1">
                  <button
                    type="button"
                    onPointerDown={handlePainPressStart}
                    onPointerUp={handlePainPressEnd}
                    onPointerCancel={handlePainPressEnd}
                    onPointerLeave={handlePainPressEnd}
                    onPointerMove={handlePainPressEnd}
                    onClick={() => {
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
                  <span className="relative">
                    <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
                    {isChatTab && <DotBadge show={unreadCount > 0} />}
                  </span>
                  <span className="text-[11px] leading-none">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* LONG PRESS MENY */}
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