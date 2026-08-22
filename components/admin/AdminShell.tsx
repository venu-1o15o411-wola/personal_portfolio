"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import { LogoMark } from "@/components/client/LogoMark";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/match", label: "AI Match" },
  { href: "/admin/shares", label: "Shares" },
];

export function AdminShell({
  children,
  profileName,
}: {
  children: React.ReactNode;
  profileName: string;
}) {
  const pathname = usePathname();

  return (
    <div className="admin-body min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-black/5 bg-ink text-cream md:flex">
        <div className="flex items-center gap-3 px-6 py-7">
          <LogoMark className="h-8 w-8" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brass">
              Library
            </p>
            <p className="mt-0.5 text-base font-bold tracking-tight">{profileName}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-cream/10 text-cream"
                    : "text-muted hover:bg-cream/5 hover:text-cream"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action={logoutAction} className="px-6 py-6">
          <button type="submit" className="text-sm text-muted hover:text-cream">
            Sign out
          </button>
        </form>
      </aside>
      <div className="md:pl-60">
        <header className="flex items-center justify-between border-b border-black/5 px-4 py-4 md:hidden">
          <span className="font-serif text-xl">{profileName}</span>
          <nav className="flex gap-3 text-sm">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="text-admin-ink/60">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
