"use client";

import { useEffect, useMemo, useState } from "react";
import { Mic, MessageSquare, Play, Trophy, Users } from "lucide-react";
import { socket } from "@/lib/socket";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import {
  AnimatedLeaderboard,
  RoomChat,
  type Message,
  type Player,
} from "@/components/MultiplayerWidgets";

type Question = {
  prompt: string;
  answer: string;
  options?: string[];
  explanation?: string | null;
};

export default function MultiplayerPage() {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("General Knowledge");
  const [amount, setAmount] = useState(5);
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState("");

  const {
    isSupported,
    isListening,
    transcript,
    finalTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    socket.connect();

    const onRoomUpdate = (room: any) => {
      setPlayers(room.players || []);
      setMessages(room.messages || []);
      setQuestions(room.questions || []);
      setCurrentQuestion(room.currentQuestion || 0);
    };

    socket.on("room-update", onRoomUpdate);
    socket.on("score-update", (items: Player[]) => setPlayers(items));
    socket.on("chat-update", (items: Message[]) => setMessages(items));

    socket.on(
      "quiz-started",
      (payload: { questions: Question[]; currentQuestion: number }) => {
        setQuestions(payload.questions || []);
        setCurrentQuestion(payload.currentQuestion || 0);
        setAnswer("");
        resetTranscript();
        setError("");
      }
    );

    socket.on("question-changed", (index: number) => {
      setCurrentQuestion(index);
      setAnswer("");
      resetTranscript();
    });

    return () => {
      socket.off("room-update", onRoomUpdate);
      socket.off("score-update");
      socket.off("chat-update");
      socket.off("quiz-started");
      socket.off("question-changed");
      socket.disconnect();
    };
  }, [resetTranscript]);

  useEffect(() => {
    if (finalTranscript) {
      setAnswer(finalTranscript);
    }
  }, [finalTranscript]);

  const createRoom = () => {
    setError("");
    if (!roomId.trim() || !name.trim()) {
      setError("Enter your name and room ID first.");
      return;
    }

    socket.emit("create-room", {
      roomId: roomId.trim(),
      host: name.trim(),
    });
  };

  const joinRoom = () => {
    setError("");
    if (!roomId.trim() || !name.trim()) {
      setError("Enter your name and room ID first.");
      return;
    }

    socket.emit("join-room", {
      roomId: roomId.trim(),
      name: name.trim(),
    });
  };

  const startQuiz = async () => {
    setError("");

    if (!roomId.trim()) {
      setError("Create or join a room first.");
      return;
    }

    if (!topic.trim()) {
      setError("Enter a topic first.");
      return;
    }

    try {
      setLoadingQuestions(true);

      const res = await fetch("/api/questions/multiplayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          amount: Number(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || "Failed to generate multiplayer questions"
        );
      }

      const generatedQuestions: Question[] = (data.questions || []).map(
        (item: any) => ({
          prompt: item.prompt,
          answer: item.answer,
          options: Array.isArray(item.options) ? item.options : [],
          explanation: item.explanation || null,
        })
      );

      if (!generatedQuestions.length) {
        throw new Error("No questions were generated.");
      }

      socket.emit("start-quiz", {
        roomId: roomId.trim(),
        questions: generatedQuestions,
      });
    } catch (err: any) {
      console.error("Multiplayer start failed:", err);
      setError(err.message || "Failed to start multiplayer quiz.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const submitAnswer = () => {
    const current = questions[currentQuestion];
    if (!current) return;

    const submitted = answer.trim().toLowerCase();
    const correct = current.answer.trim().toLowerCase();

    const isCorrect =
      submitted === correct ||
      submitted.includes(correct) ||
      correct.includes(submitted);

    socket.emit("submit-answer", {
      roomId: roomId.trim(),
      isCorrect,
    });

    setAnswer("");
    resetTranscript();
  };

  const winner = useMemo(
    () => [...players].sort((a, b) => b.score - a.score)[0],
    [players]
  );

  const activeQuestion = questions[currentQuestion];

  return (
    <main className="shell space-y-8">
      <section className="glass-panel p-8 md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="section-title">Multiplayer command center</h1>
            <p className="section-copy mt-2 max-w-2xl">
              Create a room, invite players, launch the quiz, and track the
              leaderboard live.
            </p>
          </div>
          <div className="badge-pro">
            <Users className="mr-2 h-3.5 w-3.5" />
            Real-time competitive mode
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <input
          className="input-pro"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <input
          className="input-pro"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Room ID"
        />
        <input
          className="input-pro"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic"
        />
        <input
          className="input-pro"
          type="number"
          min={1}
          max={20}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <div className="flex gap-2">
          <button className="primary-btn w-full" onClick={createRoom}>
            Create
          </button>
          <button className="secondary-btn w-full" onClick={joinRoom}>
            Join
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.45fr_0.55fr]">
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
                  Live quiz room
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Room: {roomId || "-"}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  className="primary-btn"
                  onClick={startQuiz}
                  disabled={loadingQuestions}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {loadingQuestions ? "Generating..." : "Start quiz"}
                </button>

                <button
                  className="secondary-btn"
                  onClick={() =>
                    socket.emit("next-question", { roomId: roomId.trim() })
                  }
                  disabled={!questions.length}
                >
                  Next
                </button>
              </div>
            </div>

            {activeQuestion ? (
              <div className="space-y-5">
                <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10">
                  <p className="mb-2 text-sm text-slate-300">
                    Question {currentQuestion + 1} / {questions.length}
                  </p>
                  <h3 className="text-2xl font-semibold">
                    {activeQuestion.prompt}
                  </h3>
                </div>

                {activeQuestion.options?.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeQuestion.options.map((option) => (
                      <button
                        key={option}
                        className={`rounded-3xl border px-5 py-4 text-left text-sm font-medium shadow-sm transition ${
                          answer === option
                            ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        }`}
                        onClick={() => setAnswer(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : null}

                <textarea
                  className="input-pro min-h-[140px]"
                  value={answer || transcript}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type or speak your answer..."
                />

                <div className="flex flex-wrap gap-2">
                  {isSupported && (
                    <>
                      <button
                        className="primary-btn"
                        onClick={startListening}
                        disabled={isListening}
                      >
                        <Mic className="mr-2 h-4 w-4" />
                        {isListening ? "Listening..." : "Start voice"}
                      </button>
                      <button className="secondary-btn" onClick={stopListening}>
                        Stop voice
                      </button>
                    </>
                  )}

                  <button
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                    onClick={submitAnswer}
                  >
                    Submit answer
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                Start the quiz to load real generated questions.
              </div>
            )}
          </div>

          <RoomChat
            messages={messages}
            currentUserId={socket.id}
            onSend={(text) =>
              socket.emit("send-message", {
                roomId: roomId.trim(),
                text,
                name: name.trim(),
              })
            }
          />
        </div>

        <div className="space-y-6">
          <div className="dashboard-card">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-500">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                  Live leaderboard
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Real-time room ranking
                </p>
              </div>
            </div>
            <AnimatedLeaderboard players={players} currentUserId={socket.id} />
          </div>

          <div className="dashboard-card">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                  Top player
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Current room champion
                </p>
              </div>
            </div>

            {winner ? (
              <p className="text-lg font-semibold text-slate-950 dark:text-white">
                {winner.name} • {winner.score} pts
              </p>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">
                No players yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}