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

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("create-room", ({ roomId, host }) => {
      if (!roomId?.trim() || !host?.trim()) return;

      const cleanRoomId = roomId.trim().toUpperCase();
      const cleanHost = host.trim();

      const room = updateRoom(cleanRoomId, () => ({
        players: [{ id: socket.id, name: cleanHost, score: 0 }],
        questions: [],
        currentQuestion: 0,
        messages: [],
      }));

      socket.join(cleanRoomId);
      io.to(cleanRoomId).emit("room-update", room);
    });

    socket.on("join-room", ({ roomId, name }) => {
      if (!roomId?.trim() || !name?.trim()) return;

      const cleanRoomId = roomId.trim().toUpperCase();
      const cleanName = name.trim();

      const room = updateRoom(cleanRoomId, (existing) => {
        if (!existing) return undefined;

        if (!existing.players.some((player) => player.id === socket.id)) {
          existing.players.push({
            id: socket.id,
            name: cleanName,
            score: 0,
          });
        }

        return existing;
      });

      if (!room) return;

      socket.join(cleanRoomId);
      io.to(cleanRoomId).emit("room-update", room);
    });

    socket.on("start-quiz", ({ roomId, questions }) => {
      if (!roomId?.trim() || !Array.isArray(questions)) return;

      const cleanRoomId = roomId.trim().toUpperCase();

      const room = updateRoom(cleanRoomId, (existing) => {
        if (!existing) return undefined;
        existing.questions = questions;
        existing.currentQuestion = 0;
        return existing;
      });

      if (!room) return;

      io.to(cleanRoomId).emit("quiz-started", {
        questions,
        currentQuestion: 0,
      });
      io.to(cleanRoomId).emit("room-update", room);
    });

    socket.on("submit-answer", ({ roomId, isCorrect }) => {
      if (!roomId?.trim()) return;

      const cleanRoomId = roomId.trim().toUpperCase();

      const room = updateRoom(cleanRoomId, (existing) => {
        if (!existing) return undefined;

        const player = existing.players.find((p) => p.id === socket.id);
        if (player && isCorrect) {
          player.score += 1;
        }

        return existing;
      });

      if (!room) return;

      io.to(cleanRoomId).emit("score-update", room.players);
      io.to(cleanRoomId).emit("room-update", room);
    });

    socket.on("next-question", ({ roomId }) => {
      if (!roomId?.trim()) return;

      const cleanRoomId = roomId.trim().toUpperCase();

      const room = updateRoom(cleanRoomId, (existing) => {
        if (!existing) return undefined;
        existing.currentQuestion += 1;
        return existing;
      });

      if (!room) return;

      io.to(cleanRoomId).emit("question-changed", room.currentQuestion);
      io.to(cleanRoomId).emit("room-update", room);
    });

    socket.on("send-message", ({ roomId, text, name }) => {
      if (!roomId?.trim() || !text?.trim() || !name?.trim()) return;

      const cleanRoomId = roomId.trim().toUpperCase();
      const cleanText = text.trim();
      const cleanName = name.trim();

      const room = updateRoom(cleanRoomId, (existing) => {
        if (!existing) return undefined;

        existing.messages.push({
          id: randomUUID(),
          userId: socket.id,
          name: cleanName,
          text: cleanText,
          createdAt: Date.now(),
        });

        return existing;
      });

      if (!room) return;

      io.to(cleanRoomId).emit("chat-update", room.messages);
      io.to(cleanRoomId).emit("room-update", room);
    });

    socket.on("disconnecting", () => {
      for (const joinedRoomId of socket.rooms) {
        if (joinedRoomId === socket.id) continue;

        const room = updateRoom(joinedRoomId, (existing) => {
          if (!existing) return undefined;

          existing.players = existing.players.filter(
            (p) => p.id !== socket.id
          );

          return existing.players.length ? existing : undefined;
        });

        const rooms = readRooms();

        if (rooms[joinedRoomId]) {
          io.to(joinedRoomId).emit("score-update", rooms[joinedRoomId].players);
          io.to(joinedRoomId).emit("room-update", rooms[joinedRoomId]);
        } else if (room) {
          io.to(joinedRoomId).emit("score-update", room.players);
          io.to(joinedRoomId).emit("room-update", room);
        }
      }
    });
  });

  expressApp.all("/{*path}", (req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});