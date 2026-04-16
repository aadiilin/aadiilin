import { openai } from "./openai";
import { logger } from "./lib/logger";

export interface TriviaQuestion {
  text: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

const SYSTEM = `You are a trivia question writer for a fast-paced, live multiplayer trivia game.
You generate multiple-choice trivia questions that are fun, fair, and unambiguous.
Each question has exactly four answer choices and exactly one correct answer.
Wrong answers should be plausible but clearly wrong to someone who knows the topic.
Question text should be concise (at most ~120 characters), punchy, and suitable for a large display.
Answer choices should be short (a few words each). Do not number or prefix choices.`;

export async function generateQuestions(
  topic: string,
  count: number,
): Promise<TriviaQuestion[]> {
  const prompt = `Topic: "${topic}"

Generate exactly ${count} trivia questions about this topic.
Mix difficulty (some easy, some hard), avoid duplicates, and keep each question answerable in under 20 seconds.

Respond with JSON in this exact shape:
{
  "questions": [
    { "text": "...", "choices": ["a", "b", "c", "d"], "correctIndex": 0 }
  ]
}
"correctIndex" must be an integer 0-3 pointing to the correct answer in "choices".`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: { questions?: unknown };
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    logger.error({ err, raw }, "Failed to parse LLM JSON");
    throw new Error("Failed to parse question generation response");
  }

  const list = parsed.questions;
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("No questions returned from LLM");
  }

  const cleaned: TriviaQuestion[] = [];
  for (const q of list) {
    if (
      q &&
      typeof q === "object" &&
      typeof (q as Record<string, unknown>)["text"] === "string" &&
      Array.isArray((q as Record<string, unknown>)["choices"]) &&
      typeof (q as Record<string, unknown>)["correctIndex"] === "number"
    ) {
      const rec = q as Record<string, unknown>;
      const choices = rec["choices"] as unknown[];
      const idx = rec["correctIndex"] as number;
      if (
        choices.length === 4 &&
        choices.every((c) => typeof c === "string") &&
        idx >= 0 &&
        idx <= 3
      ) {
        cleaned.push({
          text: rec["text"] as string,
          choices: choices as [string, string, string, string],
          correctIndex: idx as 0 | 1 | 2 | 3,
        });
      }
    }
  }

  if (cleaned.length === 0) {
    throw new Error("No valid questions produced");
  }

  return cleaned.slice(0, count);
}
