import fs from "fs";
import path from "path";

export type Player = { id: string; name: string; score: number };
export type Question = { prompt: string; answer: string; options?: string[] };
export type Message = { id: string; userId: string; name: string; text: string; createdAt: number };
export type Room = {
  players: Player[];
  questions: Question[];
  currentQuestion: number;
  messages: Message[];
};

const dataDir = path.join(process.cwd(), ".runtime");
const roomsFile = path.join(dataDir, "multiplayer-rooms.json");

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(roomsFile)) fs.writeFileSync(roomsFile, JSON.stringify({}));
}

export function readRooms(): Record<string, Room> {
  try {
    ensureStore();
    return JSON.parse(fs.readFileSync(roomsFile, "utf8"));
  } catch {
    return {};
  }
}

export function writeRooms(rooms: Record<string, Room>) {
  ensureStore();
  fs.writeFileSync(roomsFile, JSON.stringify(rooms, null, 2));
}

export function updateRoom(roomId: string, updater: (room: Room | undefined) => Room | undefined) {
  const rooms = readRooms();
  const nextRoom = updater(rooms[roomId]);
  if (!nextRoom) delete rooms[roomId];
  else rooms[roomId] = nextRoom;
  writeRooms(rooms);
  return rooms[roomId];
}
