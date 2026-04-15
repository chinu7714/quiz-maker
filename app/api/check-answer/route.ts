import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

function normalize(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function tokenize(text: string) {
  return normalize(text)
    .split(" ")
    .filter((token) => token.length > 2);
}

function keywordScore(userInput: string, answer: string) {
  const userTokens = new Set(tokenize(userInput));
  const answerTokens = tokenize(answer);

  if (!answerTokens.length) return 0;

  const matched = answerTokens.filter((token) => userTokens.has(token)).length;
  return matched / answerTokens.length;
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const questionId = Number(body.questionId);
    const userInput = String(body.userInput || "");

    if (Number.isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid questionId" }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const submittedAnswer = normalize(userInput);
    const correctAnswer = normalize(question.answer || "");
    const overlap = keywordScore(userInput, question.answer || "");

    const isCorrect =
      submittedAnswer === correctAnswer ||
      (!!submittedAnswer && submittedAnswer.includes(correctAnswer)) ||
      (!!correctAnswer && correctAnswer.includes(submittedAnswer)) ||
      overlap >= 0.6;

    return NextResponse.json({
      success: true,
      correct: isCorrect,
      confidence: Number(overlap.toFixed(2)),
      correctAnswer: question.answer,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error("Check answer error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
