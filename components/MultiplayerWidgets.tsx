"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

export type Player = { id: string; name: string; score: number };
export type Message = { id: string; userId: string; name: string; text: string; createdAt: number };

export function AnimatedLeaderboard({ players, currentUserId }: { players: Player[]; currentUserId?: string }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {sorted.map((player, index) => (
          <motion.div
            key={player.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center justify-between rounded-3xl border p-4 shadow-sm ${
              player.id === currentUserId ? "border-indigo-200 bg-indigo-50/70" : "border-slate-200 bg-white"
            }`}
          >
            <div>
              <p className="font-semibold text-slate-950">#{index + 1} {player.name}</p>
              <p className="text-xs text-slate-500">{player.id === currentUserId ? "You" : "Player"}</p>
            </div>
            <p className="text-xl font-semibold text-slate-950">{player.score}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function RoomChat({ messages, currentUserId, onSend }: { messages: Message[]; currentUserId?: string; onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const sorted = useMemo(() => [...messages].sort((a, b) => a.createdAt - b.createdAt), [messages]);

  return (
    <div className="flex h-[460px] flex-col rounded-[28px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="border-b border-slate-200 p-5"><h2 className="text-lg font-semibold text-slate-950">Room chat</h2></div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {sorted.map((message) => {
          const mine = message.userId === currentUserId;
          return (
            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm shadow-sm ${mine ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-800"}`}>
                <p className="mb-1 text-xs opacity-70">{message.name}</p>
                <p>{message.text}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-slate-200 p-4">
        <div className="flex gap-2">
          <input className="input-pro" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type message..." />
          <button
            className="primary-btn"
            onClick={() => {
              if (!text.trim()) return;
              onSend(text.trim());
              setText("");
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
