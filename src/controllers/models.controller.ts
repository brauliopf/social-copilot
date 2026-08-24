import type { Request, Response } from "express";
import { OpenAIError, queryOpenAI } from "../services/openai.service";
import {
  OpenRouterError,
  queryOpenRouter,
  type ChatMessage,
} from "../services/openrouter.service";

const PROVIDERS = ["openrouter", "openai"] as const;
type Provider = (typeof PROVIDERS)[number];

type QueryBody = {
  prompt?: unknown;
  system_prompt?: unknown;
  model?: unknown;
  provider?: unknown;
};

type QueryResponse = {
  content: string;
  model?: string;
  usage?: Record<string, number>;
};

export async function queryModel(
  req: Request<unknown, QueryResponse | { error: string }, QueryBody>,
  res: Response<QueryResponse | { error: string }>,
): Promise<void> {
  const { prompt, system_prompt, model, provider } = req.body || {};

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    res.status(400).json({ error: "prompt must be a non-empty string" });
    return;
  }
  if (system_prompt !== undefined && typeof system_prompt !== "string") {
    res.status(400).json({ error: "system_prompt must be a string" });
    return;
  }
  if (model !== undefined && (typeof model !== "string" || model.trim().length === 0)) {
    res.status(400).json({ error: "model must be a non-empty string" });
    return;
  }
  if (provider !== undefined && !isProvider(provider)) {
    res.status(400).json({ error: "provider must be openrouter or openai" });
    return;
  }

  const messages: ChatMessage[] = [];
  if (system_prompt) messages.push({ role: "system", content: system_prompt });
  messages.push({ role: "user", content: prompt });
  const selectedProvider: Provider = isProvider(provider) ? provider : "openrouter";

  try {
    const completion =
      selectedProvider === "openai"
        ? await queryOpenAI(messages, model as string | undefined)
        : await queryOpenRouter(messages, model as string | undefined);
    const content = completion.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      res.status(502).json({ error: "Model returned no message content" });
      return;
    }

    res.status(200).json({
      content,
      model: completion.model,
      usage: completion.usage,
    });
  } catch (error) {
    if (error instanceof OpenRouterError || error instanceof OpenAIError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(502).json({ error: "Model request failed" });
  }
}

function isProvider(value: unknown): value is Provider {
  return typeof value === "string" && (PROVIDERS as readonly string[]).includes(value);
}
