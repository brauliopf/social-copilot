import type { ChatMessage } from "./openrouter.service";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export type OpenAIResponse = {
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

export class OpenAIError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 502,
  ) {
    super(message);
    this.name = "OpenAIError";
  }
}

export async function queryOpenAI(
  messages: ChatMessage[],
  model = process.env.OPENAI_MODEL || "gpt-4o-mini",
): Promise<OpenAIResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new OpenAIError("OPENAI_API_KEY is not configured", 500);
  }

  let response: Response;
  try {
    response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages }),
    });
  } catch {
    throw new OpenAIError("Could not connect to OpenAI");
  }

  const body = (await response.json()) as OpenAIResponse;
  if (!response.ok) {
    throw new OpenAIError(
      body.error?.message || "OpenAI returned an error",
      502,
    );
  }

  return body;
}
