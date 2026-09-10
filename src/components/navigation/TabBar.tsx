"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";
import { useRef, useState } from "react";
import type { ElementType } from "react";

import { useChatUnread } from "@/stores/chatUnread.store";
import { cn } from "@/ui/cn";

import {
  Home,
  Gauge,
  Calendar,
  HeartPulse,
  MessageCircle,
  User,
  Users,
  Settings,
  Shield,
  Activity,
  Utensils,
  UserCog,
} from "lucide-react";

type TabItem = {
  label: string;
  href: string;
  icon: ElementType;
};

const clientTabs: TabItem[] = [
  { label: "Hjem", href: "/dashboard", icon: Home },
  { label: "Sonen", href: "/sonen", icon: Gauge },
  { label: "Smerte", href: "/pain", icon: HeartPulse },
  { label: "Meld.", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

const trainerTabs: TabItem[] = [
  { label: "Hjem", href: "/dashboard", icon: Home },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Meld.", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

const adminTabs: TabItem[] = [
  { label: "Admin", href: "/dashboard", icon: Shield },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Trenere", href: "/trainers", icon: UserCog },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Innst.", href: "/settings", icon: Settings },
];

function DotBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-surface bg-danger"
      aria-label="Uleste meldinger"
    />
  );
}

export default function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, loading } = useRole();
  const unreadCount = useChatUnread((s) => s.unreadCount);

  const [showPainMenu, setShowPainMenu] = useState(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);
  const LONG_PRESS_MS = 700;

  if (loading || !role) return null;

  const items = role === "client" ? clientTabs : role === "trainer" ? trainerTabs : adminTabs;

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
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        style={{ minHeight: 72 }}
      >
        <ul className="flex items-stretch justify-between px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const isPainTab = role === "client" && item.href === "/pain";
            const isChatTab = item.href === "/chat";

            const baseClass = cn(
              "flex w-full select-none flex-col items-center justify-center gap-1 py-3 transition-colors",
              isActive ? "text-primary" : "text-ink-faint"
            );

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
                    <Icon size={23} strokeWidth={isActive ? 2.4 : 1.9} />
                    <span className="text-[11px] leading-none">{item.label}</span>
                  </button>
                </li>
              );
            }

            return (
              <li key={item.href} className="flex-1">
                <Link href={item.href} className={baseClass}>
                  <span className="relative">
                    <Icon size={22} strokeWidth={isActive ? 2.3 : 1.8} />
                    {isChatTab && <DotBadge show={unreadCount > 0} />}
                  </span>
                  <span className="text-[11px] leading-none">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {role === "client" && showPainMenu && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/30"
          onClick={() => setShowPainMenu(false)}
        >
          <div
            className="mb-24 w-[92%] max-w-sm rounded-lg border border-border bg-surface p-4 shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 text-center text-xs text-ink-soft">Velg fokus</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowPainMenu(false);
                  router.push("/tests");
                }}
                className="flex flex-col items-center gap-2 rounded-md border border-border p-4 transition-colors hover:bg-surface-alt"
              >
                <Activity size={20} />
                <span className="text-sm font-medium">Tester</span>
              </button>

              <button
                onClick={() => {
                  setShowPainMenu(false);
                  router.push("/nutrition");
                }}
                className="flex flex-col items-center gap-2 rounded-md border border-border p-4 transition-colors hover:bg-surface-alt"
              >
                <Utensils size={20} />
                <span className="text-sm font-medium">Kosthold</span>
              </button>
            </div>

            <button
              onClick={() => setShowPainMenu(false)}
              className="mt-4 w-full rounded-md border border-border py-2 text-sm text-ink-soft hover:bg-surface-alt"
            >
              Lukk
            </button>
          </div>
        </div>
      )}
    </>
  );
}
