"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Crown, LayoutDashboard, LogIn, LogOut, Shield, Trophy, Users } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/multiplayer", label: "Multiplayer", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/payment", label: "Pro", icon: Crown }
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15">
              <span className="text-lg font-bold">Q</span>
            </div>
            <div>
              <p className="text-base font-semibold text-slate-950">Quizmify</p>
              <p className="text-xs text-slate-500">AI quiz SaaS dashboard</p>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 p-1.5 md:flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-900/10"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname === "/admin" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {session?.user?.name && (
            <div className="hidden rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 lg:block">
              {session.user.name}
            </div>
          )}
          {session ? (
            <button className="primary-btn" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          ) : (
            <button className="primary-btn" onClick={() => signIn("google")}>
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
