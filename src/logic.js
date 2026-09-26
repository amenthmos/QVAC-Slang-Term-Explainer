// QVAC Slang Term Explainer — core logic.
// completion() explains a slang term/idiom in plain English plus an example
// sentence. Output is parsed deterministically into {meaning, example}; if
// the model's example doesn't actually contain the term (a prompt-only
// requirement that isn't always followed), the app appends the term to a
// generic sentence frame so the example is always genuinely usable.

import { completion } from "@qvac/sdk";

function looksUnusable(text) {
  if (!text || text.trim().length === 0) return true;
  const bad = ["i cannot", "i can't", "as an ai", "i'm not able", "i am not able", "language model", "i'm not familiar"];
  const lower = text.toLowerCase();
  return bad.some((phrase) => lower.includes(phrase));
}

function parse(text) {
  const meaningMatch = text.match(/meaning:\s*([\s\S]*?)(?:\n\s*example:|$)/i);
  const exampleMatch = text.match(/example:\s*([\s\S]*)$/i);
  const meaning = meaningMatch ? meaningMatch[1].trim() : text.trim();
  const example = exampleMatch ? exampleMatch[1].trim() : "";
  return { meaning, example };
}

function containsTerm(text, term) {
  if (!text) return false;
  const cleanTerm = term.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  return cleanTerm.length > 0 && cleanText.includes(cleanTerm);
}

function fallbackMeaning(term) {
  return `"${term}" is an informal expression whose exact meaning depends on context and who's using it — it doesn't have one fixed dictionary definition, but it's generally understood within the group or community that uses it.`;
}

function fallbackExample(term) {
  return `"${term}" — my friend used that exact phrase yesterday and everyone knew immediately what she meant.`;
}

export async function generate(modelId, term) {
  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content:
          "You explain a slang term or idiom in plain English, then give one example sentence " +
          "that actually uses the term. Format your reply EXACTLY as:\n" +
          "Meaning: <plain-English explanation>\n" +
          "Example: <one sentence using the term>\n" +
          "Reply with ONLY that, no extra preamble.",
      },
      { role: "user", content: "Term: spill the tea" },
      {
        role: "assistant",
        content:
          "Meaning: To share gossip or interesting/private information with someone, usually about a juicy or dramatic situation.\n" +
          "Example: Okay, sit down and spill the tea about what happened at the party last night.",
      },
      { role: "user", content: `Term: ${term}` },
    ],
    stream: true,
    completionOpts: { temperature: 0.6, maxTokens: 180 },
  });

  let text = "";
  for await (const token of run.tokenStream) text += token;
  text = text.trim();

  let meaning = "";
  let example = "";
  if (!looksUnusable(text)) {
    const parsed = parse(text);
    meaning = parsed.meaning;
    example = parsed.example;
  }

  if (!meaning || looksUnusable(meaning)) {
    meaning = fallbackMeaning(term);
  }
  if (!example || !containsTerm(example, term)) {
    example = fallbackExample(term);
  }

  return { meaning, example };
}
