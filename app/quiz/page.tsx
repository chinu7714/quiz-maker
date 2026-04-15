"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";

const presets = ["JavaScript", "Data Science", "Aptitude", "Networking", "TCS NQT", "React"];

export default function QuizCreatePage() {
  const router = useRouter();
  const [topic, setTopic] = useState("General Knowledge");
  const [focus, setFocus] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [amount, setAmount] = useState(5);
  const [type, setType] = useState("MCQ");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createQuiz = async () => {
    setLoading(true);
    setError("");
    try {
      const gameRes = await fetch("/api/game/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, amount, type }),
      });
      const gameData = await gameRes.json();
      if (!gameRes.ok) throw new Error(gameData.error || "Failed to create game");

      const questionsRes = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, amount, gameId: gameData.id, type, difficulty, focus }),
      });
      const questionsData = await questionsRes.json();
      if (!questionsRes.ok) {
        throw new Error(questionsData.error || "Failed to generate quiz questions");
      }

      router.push(`/play/${gameData.id}`);
    } catch (err: any) {
      setError(err?.message || "Something went wrong while creating the quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="shell">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel p-8 md:p-10">
          <span className="badge-pro mb-4">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            AI powered quiz studio
          </span>
          <h1 className="section-title">Create a startup-grade quiz flow</h1>
          <p className="section-copy mt-3 max-w-2xl">
            Configure topic, question volume, answer format, difficulty, and focus area. Quizmify will create the session, generate the questions, and move you directly into gameplay.
          </p>

          <div className="mt-8 grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Quiz topic</label>
              <input
                className="input-pro"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {presets.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="badge-pro"
                    onClick={() => setTopic(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Topic filter / focus area</label>
              <input
                className="input-pro"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="Example: hooks, subnetting, aptitude shortcuts"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Number of questions</label>
                <input
                  className="input-pro"
                  type="number"
                  min={1}
                  max={20}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Answer type</label>
                <select className="input-pro" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="MCQ">MCQ</option>
                  <option value="OPEN_ENDED">Open Ended</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Difficulty</label>
                <select className="input-pro" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <button className="primary-btn" onClick={createQuiz} disabled={loading}>
                <Wand2 className="mr-2 h-4 w-4" />
                {loading ? "Creating quiz..." : "Generate quiz session"}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setTopic("General Knowledge");
                  setAmount(5);
                  setType("MCQ");
                  setDifficulty("MEDIUM");
                  setFocus("");
                }}
              >
                Reset setup
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="dashboard-card bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <p className="text-sm text-slate-300 dark:text-slate-600">Recommended flow</p>
            <h2 className="mt-2 text-2xl font-semibold">Best for demos and product walkthroughs</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300 dark:text-slate-600">
              Use MCQ for a fast interactive flow, or switch to open-ended when you want richer written answers and deeper evaluation.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <div>
                <p className="text-2xl font-semibold">{amount}</p>
                <p className="text-xs text-slate-300 dark:text-slate-600">Questions</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{type === "MCQ" ? "Fast" : "Deep"}</p>
                <p className="text-xs text-slate-300 dark:text-slate-600">Experience</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{difficulty[0] + difficulty.slice(1).toLowerCase()}</p>
                <p className="text-xs text-slate-300 dark:text-slate-600">Difficulty</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">AI</p>
                <p className="text-xs text-slate-300 dark:text-slate-600">Generated</p>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Tips</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li>• Use specific topics like “React Hooks”, “Quantitative Aptitude”, or “Computer Networks”.</li>
              <li>• Add a focus area to make the quiz more targeted.</li>
              <li>• Hard mode works best for interview prep and mock assessment rounds.</li>
            </ul>
            <div className="mt-6 rounded-3xl bg-slate-50 p-5 dark:bg-slate-900/60">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Next step</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                After generation, you’ll be moved directly to the play screen with cleaner scoring, better answer validation, and upgraded analytics.
              </p>
              <div className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
                Ready to launch <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
