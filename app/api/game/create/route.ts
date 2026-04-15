import { NextResponse } from "next/server";
import { QuizType } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { topic, amount, type } = await req.json();
  const game = await prisma.game.create({
    data: {
      userId: session.user.id,
      topic,
      amount: Number(amount),
      type: type === "OPEN_ENDED" ? QuizType.OPEN_ENDED : QuizType.MCQ
    }
  });
  return NextResponse.json(game);
}
