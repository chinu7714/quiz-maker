import Link from "next/link";
import { ArrowRight, Bot, Crown, ShieldCheck, Sparkles, Trophy, Users } from "lucide-react";

const features = [
  { icon: Bot, title: "AI quiz generation", text: "Create topic-based quizzes instantly with an intelligent workflow." },
  { icon: Users, title: "Multiplayer rooms", text: "Run live quiz battles with chat, voice support, and real-time scoring." },
  { icon: Trophy, title: "Competitive analytics", text: "Track score history, rankings, and completed quiz performance." },
  { icon: ShieldCheck, title: "Admin controls", text: "Monitor platform activity, users, games, and payments from one place." }
];

export default function HomePage() {
  return (
    <main className="shell space-y-8 py-10 md:py-14">
      <section className="glass-panel overflow-hidden p-8 md:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span className="badge-pro mb-5">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Redesigned professional SaaS interface
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              Launch AI quizzes with a polished dashboard experience.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              Quizmify combines quiz generation, multiplayer gameplay, payments, voice answers, and admin controls in a clean product-style interface.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="primary-btn">
                Open Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/multiplayer" className="secondary-btn">Explore Multiplayer</Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20 sm:col-span-2">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Engagement overview</p>
                  <h2 className="mt-1 text-3xl font-semibold">+42% faster quiz creation</h2>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm">Live product demo</div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><p className="text-3xl font-semibold">12k+</p><p className="text-sm text-slate-300">Questions generated</p></div>
                <div><p className="text-3xl font-semibold">840+</p><p className="text-sm text-slate-300">Competitive games</p></div>
                <div><p className="text-3xl font-semibold">99.9%</p><p className="text-sm text-slate-300">Uptime ready</p></div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Pro plan</p>
              <p className="mt-2 text-2xl font-semibold">Premium quizzes</p>
              <p className="mt-3 text-sm text-slate-600">Higher limits, premium gameplay, and cleaner commerce flow.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Admin</p>
              <p className="mt-2 text-2xl font-semibold">Operational visibility</p>
              <p className="mt-3 text-sm text-slate-600">Track users, payments, and game performance in one panel.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="dashboard-card">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </div>
        ))}
      </section>

      <section className="glass-panel grid gap-6 p-8 md:grid-cols-3">
        <div>
          <p className="text-sm font-medium text-indigo-600">Core modules</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">Everything organized like a modern SaaS product.</h2>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <Users className="h-5 w-5 text-indigo-600" />
          <h3 className="mt-4 text-lg font-semibold">Game modes</h3>
          <p className="mt-2 text-sm text-slate-600">Single-player, open-ended, MCQ, and live multiplayer sessions.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <Crown className="h-5 w-5 text-amber-500" />
          <h3 className="mt-4 text-lg font-semibold">Monetization ready</h3>
          <p className="mt-2 text-sm text-slate-600">Razorpay checkout flow and upgrade funnel built into the experience.</p>
        </div>
      </section>
    </main>
  );
}
