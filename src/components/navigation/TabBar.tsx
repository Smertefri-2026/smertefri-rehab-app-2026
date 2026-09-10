"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";
import type { ElementType } from "react";

import { useChatUnread } from "@/stores/chatUnread.store";
import { cn } from "@/ui/cn";

import {
  Home,
  ClipboardList,
  TrendingUp,
  UserRound,
  Users,
  ListChecks,
  MessageCircle,
  Shield,
  UserCog,
  BookOpen,
  SlidersHorizontal,
} from "lucide-react";

type TabItem = {
  label: string;
  href: string;
  icon: ElementType;
  /** Rød prikk ved uleste meldinger (chat bor inne i denne flaten). */
  chatBadge?: boolean;
};

/** Speiler sidebar-navigasjonen: samme fem hovedvalg per rolle. */
const clientTabs: TabItem[] = [
  { label: "Hjem", href: "/dashboard", icon: Home },
  { label: "Min plan", href: "/min-plan", icon: ClipboardList },
  { label: "Fremgang", href: "/fremgang", icon: TrendingUp },
  { label: "Rehabtrener", href: "/trainer", icon: UserRound, chatBadge: true },
  { label: "Profil", href: "/profile", icon: SlidersHorizontal },
];

const trainerTabs: TabItem[] = [
  { label: "Hjem", href: "/dashboard", icon: Home },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Oppfølging", href: "/oppfolging", icon: ListChecks },
  { label: "Meldinger", href: "/chat", icon: MessageCircle, chatBadge: true },
  { label: "Profil", href: "/profile", icon: SlidersHorizontal },
];

const adminTabs: TabItem[] = [
  { label: "Oversikt", href: "/dashboard", icon: Shield },
  { label: "Kunder", href: "/clients", icon: Users },
  { label: "Trenere", href: "/trainers", icon: UserCog },
  { label: "Innhold", href: "/admin/innhold", icon: BookOpen },
  { label: "System", href: "/admin", icon: SlidersHorizontal },
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
  const { role, loading } = useRole();
  const unreadCount = useChatUnread((s) => s.unreadCount);

  if (loading || !role) return null;

  const items = role === "client" ? clientTabs : role === "trainer" ? trainerTabs : adminTabs;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      style={{ minHeight: 72 }}
    >
      <ul className="flex items-stretch justify-between px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const showBadge = !!item.chatBadge && unreadCount > 0;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex w-full select-none flex-col items-center justify-center gap-1 py-3 transition-colors",
                  isActive ? "text-primary" : "text-ink-faint"
                )}
              >
                <span className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.3 : 1.8} />
                  <DotBadge show={showBadge} />
                </span>
                <span className="text-[11px] leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
