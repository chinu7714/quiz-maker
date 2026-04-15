import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { gameId, score } = await req.json();
  const game = await prisma.game.update({
    where: { id: Number(gameId) },
    data: { score: Number(score), isFinished: true }
  });
  return NextResponse.json(game);
}
