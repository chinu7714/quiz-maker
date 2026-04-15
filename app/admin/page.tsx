import { redirect } from "next/navigation";
import { Activity, CreditCard, Shield, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getAuthSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/dashboard");

  const [users, games, payments] = await Promise.all([prisma.user.count(), prisma.game.count(), prisma.payment.count()]);
  const recentGames = await prisma.game.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: true } });

  return (
    <main className="shell space-y-8">
      <section className="glass-panel p-8 md:p-10">
        <div className="flex items-center gap-4">
          <div className="rounded-3xl bg-slate-950 p-4 text-white"><Shield className="h-6 w-6" /></div>
          <div>
            <h1 className="section-title">Admin panel</h1>
            <p className="section-copy mt-2">Monitor product usage, game activity, and payments from one operational workspace.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="dashboard-card"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Users</p><p className="mt-2 text-3xl font-semibold text-slate-950">{users}</p></div><div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600"><Users className="h-5 w-5" /></div></div></div>
        <div className="dashboard-card"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Games</p><p className="mt-2 text-3xl font-semibold text-slate-950">{games}</p></div><div className="rounded-2xl bg-sky-50 p-3 text-sky-600"><Activity className="h-5 w-5" /></div></div></div>
        <div className="dashboard-card"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Payments</p><p className="mt-2 text-3xl font-semibold text-slate-950">{payments}</p></div><div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><CreditCard className="h-5 w-5" /></div></div></div>
      </section>

      <section className="dashboard-card">
        <h2 className="text-2xl font-semibold text-slate-950">Recent games</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recentGames.map((game) => (
            <div key={game.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-950">{game.topic}</h3>
              <p className="mt-1 text-sm text-slate-500">{game.user.name || game.user.email}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-slate-500">Score</p><p className="mt-1 font-semibold text-slate-950">{game.score}</p></div>
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-slate-500">Created</p><p className="mt-1 font-semibold text-slate-950">{new Date(game.createdAt).toLocaleDateString()}</p></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
