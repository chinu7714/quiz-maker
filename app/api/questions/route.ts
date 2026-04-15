import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { openai } from "@/lib/openai";
import { getAuthSession } from "@/lib/auth";

function fallbackQuestions(
  topic: string,
  amount: number,
  type: string,
  difficulty = "MEDIUM",
  focus = ""
) {
  return Array.from({ length: amount }).map((_, index) => ({
    prompt: `${difficulty} ${topic}${focus ? ` (${focus})` : ""} question ${
      index + 1
    }?`,
    answer: "Sample Answer",
    options:
      type === "MCQ"
        ? ["Sample Answer", "Option 2", "Option 3", "Option 4"]
        : undefined,
    explanation: `Fallback explanation for a ${difficulty.toLowerCase()} question.`,
  }));
}

function cleanJsonPayload(content: string) {
  return content.replace(/```json/g, "").replace(/```/g, "").trim();
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const topic = String(body.topic || "General Knowledge");
    const amount = Math.min(Math.max(Number(body.amount) || 5, 1), 20);
    const type = String(body.type || "MCQ");
    const difficulty = String(body.difficulty || "MEDIUM").toUpperCase();
    const focus = String(body.focus || body.topicFilter || "").trim();
    const multiplayer = Boolean(body.multiplayer);
    const gameId =
      body.gameId !== undefined && body.gameId !== null
        ? Number(body.gameId)
        : null;

    if (!multiplayer && (gameId === null || Number.isNaN(gameId))) {
      return NextResponse.json({ error: "Invalid gameId" }, { status: 400 });
    }

    const difficultyGuide: Record<string, string> = {
      EASY: "simple, direct, beginner-friendly",
      MEDIUM: "balanced and interview-friendly",
      HARD: "challenging, analytical, and detail-oriented",
    };

    const targetTopic = focus ? `${topic} with special focus on ${focus}` : topic;

    const prompt =
      type === "OPEN_ENDED"
        ? `Generate ${amount} ${difficulty.toLowerCase()} open-ended quiz questions on ${targetTopic}. The questions should be ${
            difficultyGuide[difficulty] || difficultyGuide.MEDIUM
          }. Return ONLY valid JSON array with keys prompt, answer, explanation.`
        : `Generate ${amount} ${difficulty.toLowerCase()} MCQ quiz questions on ${targetTopic}. The questions should be ${
            difficultyGuide[difficulty] || difficultyGuide.MEDIUM
          }. Return ONLY valid JSON array with keys prompt, options, answer, explanation. Options must be exactly 4 strings and answer must match one of the options.`;

    let parsed: any[] = [];

    try {
      const completion = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: difficulty === "HARD" ? 0.9 : 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are a quiz generator. Return only raw JSON. No markdown. No code fences.",
          },
          { role: "user", content: prompt },
        ],
      });

      const content = cleanJsonPayload(
        completion.choices?.[0]?.message?.content || "[]"
      );

      parsed = JSON.parse(content);
    } catch (error) {
      console.error("AI question generation failed, using fallback:", error);
      parsed = fallbackQuestions(topic, amount, type, difficulty, focus);
    }

    const normalizedQuestions = parsed.map((item: any) => ({
      prompt: item.prompt || "Untitled question",
      answer: item.answer || "",
      options: Array.isArray(item.options) ? item.options.slice(0, 4) : undefined,
      explanation: item.explanation || null,
    }));

    if (multiplayer) {
      return NextResponse.json({
        success: true,
        questions: normalizedQuestions,
      });
    }

    await prisma.question.createMany({
      data: normalizedQuestions.map((item) => ({
        gameId: gameId as number,
        prompt: item.prompt,
        answer: item.answer,
        explanation: item.explanation,
        optionsJson: item.options ? JSON.stringify(item.options) : null,
      })),
    });

    return NextResponse.json({
      success: true,
      count: normalizedQuestions.length,
    });
  } catch (error) {
    console.error("Question route failed:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}