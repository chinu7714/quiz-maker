import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const game = await prisma.game.findFirst({
    where: { id: Number(id), userId: session.user.id },
    include: { questions: true }
  });
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
  return NextResponse.json(game);
}
