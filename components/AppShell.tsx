"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  Bell,
  ChevronRight,
  Crown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Search,
  Shield,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quiz", label: "Create Quiz", icon: Sparkles },
  { href: "/multiplayer", label: "Multiplayer", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/payment", label: "Upgrade", icon: Crown },
];

const SIDEBAR_WIDTH = "18rem";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const resolvedLinks = useMemo(() => {
    return session?.user?.role === "ADMIN"
      ? [...links, { href: "/admin", label: "Admin", icon: Shield }]
      : links;
  }, [session?.user?.role]);

  const SidebarContent = () => (
    <>
      <Link
        href="/"
        className="flex items-center gap-3 rounded-[28px] border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
        onClick={() => setIsOpen(false)}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-950">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-950 dark:text-white">
            Quizmify
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            AI learning workspace
          </p>
        </div>
      </Link>

      <div className="mt-8">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Workspace
        </p>
        <nav className="mt-3 space-y-1.5">
          {resolvedLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-950"
                    : "text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{label}</span>
                <ChevronRight
                  className={`h-4 w-4 transition ${
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 rounded-[28px] bg-slate-950 p-5 text-white dark:bg-white dark:text-slate-950">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300 dark:text-slate-500">
          Pro preview
        </p>
        <h3 className="mt-3 text-xl font-semibold">
          Make quiz ops feel premium.
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-300 dark:text-slate-600">
          Track performance, run multiplayer sessions, and manage your content
          from one modern workspace.
        </p>
        <Link
          href="/payment"
          className="secondary-btn mt-4 w-full border-white/10 bg-white/10 text-white hover:bg-white/20 dark:border-slate-200 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
        >
          Explore Pro
        </Link>
      </div>

      <div className="mt-auto rounded-[28px] border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Account
        </p>
        <p className="mt-3 truncate text-sm font-semibold text-slate-900 dark:text-white">
          {session?.user?.name || session?.user?.email || "Guest mode"}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {session?.user?.isPro ? "Pro workspace active" : "Free workspace"}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <button className="primary-btn flex-1" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          ) : (
            <button
              className="primary-btn flex-1"
              onClick={() => signIn("google")}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.1),transparent_22%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_24%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_22%)]" />

      <aside
        className="fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200/70 bg-white/80 px-5 py-6 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 xl:block"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="flex h-full flex-col">
          <SidebarContent />
        </div>
      </aside>

      <div className="min-h-screen xl:pl-[18rem]">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
          <div className="shell flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-700 xl:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Welcome to Quizmify
                </p>
                <h1 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Startup-style SaaS experience
                </h1>
              </div>
            </div>

            <div className="hidden flex-1 justify-center px-8 lg:flex">
              <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                <Search className="h-4 w-4" />
                Search quizzes, sessions, analytics...
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <Bell className="h-4 w-4" />
              </button>

              <ThemeToggle />

              <div className="hidden items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2 shadow-sm md:flex dark:border-white/10 dark:bg-white/5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                  {(session?.user?.name || session?.user?.email || "G")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {session?.user?.name || "Guest"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {session?.user?.isPro ? "Pro workspace" : "Free workspace"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div
          className={`fixed inset-0 z-50 xl:hidden ${
            isOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div
            className={`absolute inset-0 bg-slate-950/50 transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            className={`absolute inset-y-0 left-0 w-80 max-w-[88vw] border-r border-slate-200/70 bg-white p-5 shadow-2xl transition-transform duration-300 dark:border-white/10 dark:bg-slate-950 ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="mb-5 flex items-center justify-end">
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex h-[calc(100%-3.5rem)] flex-col">
              <SidebarContent />
            </div>
          </div>
        </div>

        <main>{children}</main>
      </div>
    </div>
  );
}