import { prisma } from "@/lib/db";
import { Medal, Trophy } from "lucide-react";

export default async function LeaderboardPage() {
  const games = await prisma.game.findMany({
    where: { isFinished: true },
    orderBy: { score: "desc" },
    take: 10,
    include: { user: true }
  });

  return (
    <main className="shell space-y-8">
      <section className="glass-panel p-8 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="section-title">Leaderboard</h1>
            <p className="section-copy mt-2">See the top-performing players across completed quiz sessions.</p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-5 py-3 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Top 10</p>
            <p className="mt-1 text-lg font-semibold">Competitive ranking</p>
          </div>
        </div>
      </section>

      <section className="dashboard-card">
        <div className="space-y-4">
          {games.map((game, index) => (
            <div key={game.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-semibold ${index === 0 ? "bg-amber-100 text-amber-700" : index === 1 ? "bg-slate-200 text-slate-700" : index === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"}`}>
                  {index < 3 ? <Medal className="h-5 w-5" /> : `#${index + 1}`}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-950">{game.user.name || game.user.email}</p>
                  <p className="text-sm text-slate-500">{game.topic}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Score</p>
                  <p className="text-2xl font-semibold text-slate-950">{game.score}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><Trophy className="h-5 w-5" /></div>
              </div>
            </div>
          ))}
          {!games.length && <p className="text-sm text-slate-500">No finished games yet.</p>}
        </div>
      </section>
    </main>
  );
}
