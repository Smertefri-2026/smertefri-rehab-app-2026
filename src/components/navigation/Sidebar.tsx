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
  ClipboardList,
  TrendingUp,
  UserRound,
  Users,
  ListChecks,
  CalendarDays,
  MessageCircle,
  Shield,
  UserCog,
  BookOpen,
  SlidersHorizontal,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type SidebarItem = {
  label: string;
  href: string;
  icon: ElementType;
  /** Vis rød prikk når det finnes uleste meldinger (chat bor inne i denne flaten). */
  chatBadge?: boolean;
};

/**
 * Stabil navigasjon per rolle: maks fem hovedvalg som beskriver arbeidsområdet.
 * Alt annet (Sonen, Trappen, dagens program, tester, smertelogg, kalender …)
 * bor naturlig inne i disse områdene, ikke som egne menypunkter.
 */
const clientItems: SidebarItem[] = [
  { label: "Hjem", href: "/dashboard", icon: LayoutDashboard },
  { label: "Min plan", href: "/min-plan", icon: ClipboardList },
  { label: "Fremgang", href: "/fremgang", icon: TrendingUp },
  { label: "Min rehabtrener", href: "/trainer", icon: UserRound, chatBadge: true },
];

const trainerItems: SidebarItem[] = [
  { label: "Hjem", href: "/dashboard", icon: LayoutDashboard },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Oppfølging", href: "/oppfolging", icon: ListChecks },
  { label: "Kalender", href: "/calendar", icon: CalendarDays },
  { label: "Meldinger", href: "/chat", icon: MessageCircle, chatBadge: true },
];

const adminItems: SidebarItem[] = [
  { label: "Oversikt", href: "/dashboard", icon: Shield },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Rehabtrenere", href: "/trainers", icon: UserCog },
  { label: "Innhold", href: "/admin/innhold", icon: BookOpen },
  { label: "System", href: "/admin", icon: SlidersHorizontal },
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

  const accountActive =
    pathname === "/profile" || pathname.startsWith("/profile/");

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
          const showBadge = !!item.chatBadge && hasUnread;

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
                {collapsed && showBadge && (
                  <UnreadDot className="absolute -right-1 -top-1 border-2 border-surface" />
                )}
              </span>
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {showBadge && <UnreadDot className="ml-auto" />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-0.5 border-t border-border p-2">
        <Link
          href="/profile"
          title="Profil"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-[13.5px] font-medium transition-colors",
            accountActive
              ? "bg-primary-subtle text-primary-ink"
              : "text-ink-soft hover:bg-surface-alt hover:text-ink",
            collapsed && "justify-center"
          )}
        >
          <Settings size={18} strokeWidth={accountActive ? 2.2 : 1.8} />
          {!collapsed && <span>Profil</span>}
        </Link>

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
