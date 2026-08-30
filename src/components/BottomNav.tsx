import { Link, useRouterState } from "@tanstack/react-router";
import { BellRing, BookOpen, Home, Radar, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";

export function BottomNav() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items = [
    { to: "/", label: t("nav.home"), icon: Home, match: (p: string) => p === "/" || p.startsWith("/risk") },
    { to: "/alerts", label: t("nav.alerts"), icon: BellRing, match: (p: string) => p.startsWith("/alerts") },
    {
      to: "/sentinel",
      label: t("nav.sentinel"),
      icon: Radar,
      match: (p: string) => p.startsWith("/sentinel"),
    },
    {
      to: "/guidelines",
      label: t("nav.guidelines"),
      icon: BookOpen,
      match: (p: string) => p.startsWith("/guidelines") || p.startsWith("/helplines"),
    },
    {
      to: "/account",
      label: t("nav.account"),
      icon: UserRound,
      match: (p: string) => p.startsWith("/account") || p.startsWith("/auth"),
    },
  ] as const;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85"
    >
      <ul className="mx-auto flex max-w-2xl">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
