import express from "express";
import http from "http";
import next from "next";
import { Server } from "socket.io";
import { randomUUID } from "crypto";
import { readRooms, updateRoom } from "@/lib/room-store";

const port = Number(process.env.PORT || 3000);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp);
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    socket.on("create-room", ({ roomId, host }) => {
      const room = updateRoom(roomId, () => ({
        players: [{ id: socket.id, name: host, score: 0 }],
        questions: [],
        currentQuestion: 0,
        messages: [],
      }));
      socket.join(roomId);
      io.to(roomId).emit("room-update", room);
    });

    socket.on("join-room", ({ roomId, name }) => {
      const room = updateRoom(roomId, (existing) => {
        if (!existing) return undefined;
        if (!existing.players.some((player) => player.id === socket.id)) {
          existing.players.push({ id: socket.id, name, score: 0 });
        }
        return existing;
      });
      if (!room) return;
      socket.join(roomId);
      io.to(roomId).emit("room-update", room);
    });

    socket.on("start-quiz", ({ roomId, questions }) => {
      const room = updateRoom(roomId, (existing) => {
        if (!existing) return undefined;
        existing.questions = questions;
        existing.currentQuestion = 0;
        return existing;
      });
      if (!room) return;
      io.to(roomId).emit("quiz-started", { questions, currentQuestion: 0 });
      io.to(roomId).emit("room-update", room);
    });

    socket.on("submit-answer", ({ roomId, isCorrect }) => {
      const room = updateRoom(roomId, (existing) => {
        if (!existing) return undefined;
        const player = existing.players.find((p) => p.id === socket.id);
        if (player && isCorrect) player.score += 1;
        return existing;
      });
      if (!room) return;
      io.to(roomId).emit("score-update", room.players);
      io.to(roomId).emit("room-update", room);
    });

    socket.on("next-question", ({ roomId }) => {
      const room = updateRoom(roomId, (existing) => {
        if (!existing) return undefined;
        existing.currentQuestion += 1;
        return existing;
      });
      if (!room) return;
      io.to(roomId).emit("question-changed", room.currentQuestion);
      io.to(roomId).emit("room-update", room);
    });

    socket.on("send-message", ({ roomId, text, name }) => {
      const room = updateRoom(roomId, (existing) => {
        if (!existing) return undefined;
        existing.messages.push({
          id: randomUUID(),
          userId: socket.id,
          name,
          text,
          createdAt: Date.now(),
        });
        return existing;
      });
      if (!room) return;
      io.to(roomId).emit("chat-update", room.messages);
      io.to(roomId).emit("room-update", room);
    });

    socket.on("disconnecting", () => {
      const rooms = readRooms();
      for (const roomId of socket.rooms) {
        if (roomId === socket.id) continue;
        const room = updateRoom(roomId, (existing) => {
          if (!existing) return undefined;
          existing.players = existing.players.filter((p) => p.id !== socket.id);
          return existing.players.length ? existing : undefined;
        });
        if (!rooms[roomId]) continue;
        if (room) {
          io.to(roomId).emit("score-update", room.players);
          io.to(roomId).emit("room-update", room);
        }
      }
    });
  });

  expressApp.all("/{*path}", (req, res) => handle(req, res));
  server.listen(port, () => console.log(`> Ready on http://localhost:${port}`));
});
