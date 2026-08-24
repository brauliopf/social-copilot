const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenRouterResponse = {
  id?: string;
  model?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: Record<string, number>;
  error?: {
    message?: string;
  };
};

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 502,
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export async function queryOpenRouter(
  messages: ChatMessage[],
  model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
): Promise<OpenRouterResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new OpenRouterError("OPENROUTER_API_KEY is not configured", 500);
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (process.env.OPENROUTER_SITE_URL) {
    headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
  }
  if (process.env.OPENROUTER_APP_NAME) {
    headers["X-Title"] = process.env.OPENROUTER_APP_NAME;
  }

  let response: Response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ model, messages }),
    });
  } catch {
    throw new OpenRouterError("Could not connect to OpenRouter");
  }

  const body = (await response.json()) as OpenRouterResponse;
  if (!response.ok) {
    throw new OpenRouterError(
      body.error?.message || "OpenRouter returned an error",
      502,
    );
  }

  return body;
}
