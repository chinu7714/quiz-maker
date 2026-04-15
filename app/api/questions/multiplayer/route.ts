import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

function fallbackQuestions(topic: string, amount: number) {
  return Array.from({ length: amount }).map((_, index) => ({
    prompt: `${topic} question ${index + 1}?`,
    answer: "Sample Answer",
    options: ["Sample Answer", "Option 2", "Option 3", "Option 4"],
    explanation: "Fallback multiplayer question",
  }));
}

function cleanJsonPayload(content: string) {
  return content.replace(/```json/g, "").replace(/```/g, "").trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "General Knowledge");
    const amount = Math.min(Math.max(Number(body.amount) || 5, 1), 20);

    let parsed: any[] = [];

    try {
      const completion = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are a quiz generator. Return only raw valid JSON. No markdown. No code fences.",
          },
          {
            role: "user",
            content: `Generate ${amount} short multiplayer MCQ quiz questions on "${topic}".
Return ONLY valid JSON array in this format:
[
  {
    "prompt": "Question here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "answer": "Correct option here",
    "explanation": "Short explanation here"
  }
]
Rules:
- exactly 4 options
- answer must match one option exactly
- keep questions short and clear
- make them suitable for live multiplayer play`,
          },
        ],
      });

      const content = cleanJsonPayload(
        completion.choices?.[0]?.message?.content || "[]"
      );

      parsed = JSON.parse(content);
    } catch (error) {
      console.error("Multiplayer AI generation failed, using fallback:", error);
      parsed = fallbackQuestions(topic, amount);
    }

    const normalizedQuestions = parsed.map((item: any) => ({
      prompt: item.prompt || "Untitled question",
      answer: item.answer || "",
      options: Array.isArray(item.options) ? item.options.slice(0, 4) : [],
      explanation: item.explanation || null,
    }));

    return NextResponse.json({
      success: true,
      questions: normalizedQuestions,
    });
  } catch (error) {
    console.error("Multiplayer route failed:", error);
    return NextResponse.json(
      { error: "Failed to generate multiplayer questions" },
      { status: 500 }
    );
  }
}