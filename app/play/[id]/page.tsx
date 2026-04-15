"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Target, XCircle } from "lucide-react";

type Question = {
  id: number;
  prompt: string;
  answer: string;
  optionsJson: string | null;
  explanation: string | null;
};

type ResultMap = Record<
  number,
  {
    correct: boolean;
    correctAnswer: string;
    explanation?: string | null;
  }
>;

export default function PlayPage() {
  const params = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<ResultMap>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/game/${params.id}`)
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions || []));
  }, [params.id]);

  const submit = async () => {
    try {
      setLoading(true);
      let total = 0;
      const resultMap: ResultMap = {};

      for (const question of questions) {
        const res = await fetch("/api/check-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.id,
            userInput: answers[question.id] || "",
          }),
        });

        const data = await res.json();

        if (data.correct) total += 1;

        resultMap[question.id] = {
          correct: !!data.correct,
          correctAnswer: data.correctAnswer || question.answer,
          explanation: data.explanation || question.explanation,
        };
      }

      await fetch("/api/game/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: Number(params.id), score: total }),
      });

      setResults(resultMap);
      setScore(total);
      setSubmitted(true);
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const completion = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round((Object.keys(answers).length / questions.length) * 100);
  }, [answers, questions.length]);

  const percentage = score !== null && questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const getResultMessage = () => {
    if (percentage >= 80) return "🔥 Excellent performance!";
    if (percentage >= 60) return "👍 Good job!";
    if (percentage >= 40) return "🙂 Not bad, keep practicing!";
    return "📚 Needs improvement!";
  };

  return (
    <main className="shell space-y-8">
      <section className="glass-panel overflow-hidden p-8 md:p-10">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span className="badge-pro mb-4 inline-flex">
              <Target className="mr-2 h-3.5 w-3.5" />
              Live quiz workspace
            </span>
            <h1 className="section-title">Answer with confidence</h1>
            <p className="section-copy mt-3 max-w-2xl">
              Work through each question in a focused, distraction-free layout. Submit when ready to reveal your score and answer review.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="metric-tile">
              <p className="text-sm text-slate-500 dark:text-slate-400">Completion</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{completion}%</p>
            </div>
            <div className="metric-tile">
              <p className="text-sm text-slate-500 dark:text-slate-400">Questions</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{questions.length}</p>
            </div>
            <div className="metric-tile">
              <p className="text-sm text-slate-500 dark:text-slate-400">Attempted</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{Object.keys(answers).length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        {questions.map((question, index) => {
          const options = question.optionsJson ? JSON.parse(question.optionsJson) : [];
          const questionResult = results[question.id];

          return (
            <div key={question.id} className="glass-panel p-6 md:p-7">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Question {index + 1}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{question.prompt}</h2>
                </div>
                {submitted && questionResult ? (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      questionResult.correct
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                    }`}
                  >
                    {questionResult.correct ? "Correct" : "Incorrect"}
                  </span>
                ) : null}
              </div>

              {options.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {options.map((option: string) => {
                    const isSelected = answers[question.id] === option;
                    const isCorrectOption = submitted && questionResult?.correctAnswer?.trim().toLowerCase() === option.trim().toLowerCase();
                    const isWrongSelected = submitted && isSelected && !isCorrectOption;

                    return (
                      <button
                        key={option}
                        onClick={() => !submitted && setAnswers((prev) => ({ ...prev, [question.id]: option }))}
                        disabled={submitted}
                        className={`quiz-option ${
                          isCorrectOption
                            ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200"
                            : isWrongSelected
                            ? "border-red-400 bg-red-50 text-red-900 dark:bg-red-500/10 dark:text-red-200"
                            : isSelected
                            ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                            : ""
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  className={`input-pro min-h-[140px] ${
                    submitted
                      ? questionResult?.correct
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                        : "border-red-400 bg-red-50 dark:bg-red-500/10"
                      : ""
                  }`}
                  value={answers[question.id] || ""}
                  onChange={(e) => !submitted && setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                  placeholder="Write your answer here..."
                  disabled={submitted}
                />
              )}

              {submitted && questionResult ? (
                <div className="mt-5 rounded-3xl border border-slate-200/80 bg-white/75 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-2">
                    {questionResult.correct ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span className="font-medium text-emerald-700 dark:text-emerald-300">Correct answer</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-red-700 dark:text-red-300">Review needed</span>
                      </>
                    )}
                  </div>

                  {!questionResult.correct ? (
                    <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">Correct answer:</span> {questionResult.correctAnswer}
                    </p>
                  ) : null}

                  {questionResult.explanation ? (
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Explanation:</span> {questionResult.explanation}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </section>

      <div className="flex justify-center">
        <button className="primary-btn px-8 py-3" onClick={submit} disabled={loading || submitted}>
          {loading ? "Submitting..." : submitted ? "Quiz submitted" : "Submit quiz"}
        </button>
      </div>

      {score !== null ? (
        <div className="glass-panel space-y-5 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Your score: {score} / {questions.length}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{getResultMessage()}</p>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Performance</span>
              <span>{percentage}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all" style={{ width: `${percentage}%` }} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={`rounded-full px-3 py-1 font-medium ${percentage >= 50 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"}`}>
              {percentage >= 50 ? "Passed" : "Needs work"}
            </span>
            <span className="text-slate-500 dark:text-slate-400">Attempted {Object.keys(answers).length} of {questions.length} questions</span>
          </div>
        </div>
      ) : null}
    </main>
  );
}
