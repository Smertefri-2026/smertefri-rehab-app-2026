"use client";

import { useEffect, useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";
import { useChatUnread } from "@/stores/chatUnread.store";
import { Wordmark } from "@/ui/brand/Wordmark";
import { cn } from "@/ui/cn";

import {
  LayoutDashboard,
  Gauge,
  Calendar,
  HeartPulse,
  Activity,
  Utensils,
  MessageCircle,
  User,
  Users,
  Settings,
  Shield,
  UserCog,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type SidebarItem = {
  label: string;
  href: string;
  icon: ElementType;
};

/**
 * Stabil navigasjon per rolle. Rollen bestemmer arbeidsområdet — ikke
 * hvilke funksjoner som er ferdige eller om kunden har fått trener enda.
 */
const clientItems: SidebarItem[] = [
  { label: "Hjem", href: "/dashboard", icon: LayoutDashboard },
  { label: "Sonen", href: "/sonen", icon: Gauge },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Smerter", href: "/pain", icon: HeartPulse },
  { label: "Tester", href: "/tests", icon: Activity },
  { label: "Kosthold", href: "/nutrition", icon: Utensils },
  { label: "Min rehabtrener", href: "/trainer", icon: Users },
  { label: "Meldinger", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

const trainerItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Meldinger", href: "/chat", icon: MessageCircle },
  { label: "Profil", href: "/profile", icon: User },
];

const adminItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Shield },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Rehabtrenere", href: "/trainers", icon: UserCog },
  { label: "Kalender", href: "/calendar", icon: Calendar },
  { label: "Profil", href: "/profile", icon: User },
  { label: "Innstillinger", href: "/settings", icon: Settings },
];

function UnreadDot({ className }: { className?: string }) {
  return (
    <span
      className={cn("h-2 w-2 rounded-full bg-danger", className)}
      aria-label="Uleste meldinger"
    />
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { role, loading } = useRole();
  const unreadCount = useChatUnread((s) => s.unreadCount);

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("sf_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sf_sidebar_collapsed", String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  if (loading || !role) return null;

  const items = role === "client" ? clientItems : role === "trainer" ? trainerItems : adminItems;
  const hasUnread = unreadCount > 0;

  const handleLogout = async () => {
    const { supabase } = await import("@/lib/supabaseClient");
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen flex-col border-r border-border bg-surface transition-all duration-300 md:flex",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link href="/dashboard" aria-label="SmerteFri">
            <Wordmark className="text-lg" />
          </Link>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-alt hover:text-ink-soft"
          title={collapsed ? "Åpne meny" : "Lukk meny"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const isChat = item.href === "/chat";

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                isActive
                  ? "bg-primary-subtle text-primary-ink"
                  : "text-ink-soft hover:bg-surface-alt hover:text-ink",
                collapsed && "justify-center"
              )}
            >
              <span className="relative">
                <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                {collapsed && isChat && hasUnread && (
                  <UnreadDot className="absolute -right-1 -top-1 border-2 border-surface" />
                )}
              </span>
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {isChat && hasUnread && <UnreadDot className="ml-auto" />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border p-2">
        <button
          onClick={handleLogout}
          title="Logg ut"
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13.5px] font-medium text-ink-faint transition-colors hover:bg-danger-subtle hover:text-danger-ink",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logg ut</span>}
        </button>
      </div>
    </aside>
  );
}
