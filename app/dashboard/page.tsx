import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Clock3, Crown, FileQuestion, PlayCircle, Sparkles, Target, TrendingUp, Trophy } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");

  const games = await prisma.game.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { questions: true }
  });

  const completedGames = games.filter((game) => game.isFinished);
  const totalQuestions = games.reduce((sum, game) => sum + game.questions.length, 0);
  const bestScore = completedGames.length ? Math.max(...completedGames.map((game) => game.score)) : 0;

  const recentGames = [...games].slice(0, 7).reverse();
  const maxRecentScore = recentGames.length ? Math.max(...recentGames.map((game) => Math.max(game.score, 1))) : 1;
  const completionRate = games.length ? Math.round((completedGames.length / games.length) * 100) : 0;
  const avgQuestions = games.length ? Math.round(totalQuestions / games.length) : 0;
  const totalScore = completedGames.reduce((sum, game) => sum + game.score, 0);
  const averageScore = completedGames.length ? Math.round(totalScore / completedGames.length) : 0;
  const accuracyRate = totalQuestions ? Math.round((totalScore / totalQuestions) * 100) : 0;
  const proStatus = session.user.isPro ? "Active" : "Free";

  return (
    <main className="shell space-y-8">
      <section className="glass-panel overflow-hidden p-8 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span className="badge-pro mb-4">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Welcome back, {session.user.name || session.user.email}
            </span>
            <h1 className="section-title">Your quiz control center</h1>
            <p className="section-copy mt-3 max-w-2xl">
              Manage quiz sessions, review history, continue unfinished games, and upgrade your experience from one clean dashboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/quiz" className="primary-btn">Create Quiz</Link>
              <Link href="/payment" className="secondary-btn">Upgrade Pro</Link>
            </div>
          </div>
          <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/15">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Progress snapshot</p>
                <h2 className="mt-1 text-3xl font-semibold">{games.length} total sessions</h2>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <Trophy className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div><p className="text-2xl font-semibold">{completedGames.length}</p><p className="text-xs text-slate-300">Completed</p></div>
              <div><p className="text-2xl font-semibold">{bestScore}</p><p className="text-xs text-slate-300">Best score</p></div>
              <div><p className="text-2xl font-semibold">{totalQuestions}</p><p className="text-xs text-slate-300">Questions seen</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total games</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{games.length}</p>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600"><PlayCircle className="h-5 w-5" /></div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Questions generated</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{totalQuestions}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-600"><FileQuestion className="h-5 w-5" /></div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Best score</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{bestScore}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><Trophy className="h-5 w-5" /></div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Plan</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{session.user.isPro ? "Pro" : "Free"}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{proStatus}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-500"><Crown className="h-5 w-5" /></div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Average score</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{averageScore}</p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-3 text-violet-600"><TrendingUp className="h-5 w-5" /></div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Accuracy</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{accuracyRate}%</p>
            </div>
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-600"><Target className="h-5 w-5" /></div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="dashboard-card">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Performance overview</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A quick visual snapshot of your recent quiz momentum.</p>
            </div>
            <span className="badge-pro">Last {recentGames.length || 0} sessions</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="chart-card">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Recent scores</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Session trend</h3>
                </div>
                <TrendingUp className="h-5 w-5 text-indigo-500" />
              </div>
              {recentGames.length ? (
                <div className="flex h-56 items-end gap-3">
                  {recentGames.map((game, index) => (
                    <div key={game.id} className="flex flex-1 flex-col items-center gap-3">
                      <div className="flex h-44 w-full items-end rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/80">
                        <div
                          className="w-full rounded-xl bg-gradient-to-t from-indigo-600 to-sky-400"
                          style={{ height: `${Math.max((game.score / maxRecentScore) * 100, 10)}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{game.score}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">S{index + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:text-slate-400 dark:border-slate-700 dark:text-slate-400">
                  Generate a few quizzes to unlock visual analytics.
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <div className="chart-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Completion rate</p>
                    <p className="mt-1 text-3xl font-semibold text-slate-950 dark:text-white">{completionRate}%</p>
                  </div>
                  <Target className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="mt-4 h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${Math.max(completionRate, 6)}%` }} />
                </div>
              </div>
              <div className="chart-card">
                <p className="text-sm text-slate-500 dark:text-slate-400">Average quiz size</p>
                <p className="mt-1 text-3xl font-semibold text-slate-950 dark:text-white">{avgQuestions}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">questions per session</p>
              </div>
              <div className="chart-card bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <p className="text-sm text-slate-300 dark:text-slate-600">Best result so far</p>
                <p className="mt-1 text-3xl font-semibold">{bestScore}</p>
                <p className="mt-2 text-sm text-slate-300 dark:text-slate-600">Keep pushing to beat your top score.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Recent quiz sessions</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Resume or review your latest generated games.</p>
            </div>
            <Link href="/quiz" className="secondary-btn">New session</Link>
          </div>

          {games.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {games.map((game) => (
                <div key={game.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{game.topic}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{game.type} • {game.questions.length} questions</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${game.isFinished ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
                      {game.isFinished ? "Completed" : "In progress"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/80"><p className="text-slate-500 dark:text-slate-400">Score</p><p className="mt-1 text-xl font-semibold dark:text-white">{game.score}</p></div>
                    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/80"><p className="text-slate-500 dark:text-slate-400">Created</p><p className="mt-1 text-sm font-medium dark:text-white">{new Date(game.createdAt).toLocaleDateString()}</p></div>
                  </div>
                  <Link href={`/play/${game.id}`} className="primary-btn mt-5 w-full">
                    Open session
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
              <p className="text-lg font-medium text-slate-800 dark:text-white">No quiz sessions yet</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Create your first AI quiz to start tracking progress here.</p>
              <Link href="/quiz" className="primary-btn mt-5">Create first quiz</Link>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <div className="dashboard-card">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600"><Clock3 className="h-5 w-5" /></div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Quick actions</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Jump into the most-used flows.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <Link href="/quiz" className="secondary-btn justify-between">Create a new quiz <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/multiplayer" className="secondary-btn justify-between">Open multiplayer room <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/leaderboard" className="secondary-btn justify-between">View leaderboard <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>

          <div className="dashboard-card bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <p className="text-sm text-slate-300 dark:text-slate-600">Pro experience</p>
            <h2 className="mt-2 text-2xl font-semibold">Unlock premium gameplay</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300 dark:text-slate-600">Get higher quiz limits, premium UX, and a smoother workflow for competitive learning.</p>
            <Link href="/payment" className="mt-6 inline-flex items-center rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-100 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800">
              Upgrade now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
