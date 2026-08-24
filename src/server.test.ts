import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "./server";

describe("API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;
  });

  it("reports channel health", async () => {
    const response = await request(app).get("/channels/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("queries the configured OpenRouter model", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.OPENROUTER_MODEL = "test/model";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        model: "test/model",
        choices: [{ message: { content: "Hello from the model" } }],
      }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await request(app)
      .post("/models/query")
      .send({ prompt: "Say hello" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      content: "Hello from the model",
      model: "test/model",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
        }),
        body: JSON.stringify({
          model: "test/model",
          messages: [{ role: "user", content: "Say hello" }],
        }),
      }),
    );
  });

  it("queries the configured OpenAI model", async () => {
    process.env.OPENAI_API_KEY = "test-openai-key";
    process.env.OPENAI_MODEL = "gpt-4o-mini";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        model: "gpt-4o-mini",
        choices: [{ message: { content: "Hello from OpenAI" } }],
      }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await request(app)
      .post("/models/query")
      .send({ provider: "openai", prompt: "Say hello" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      content: "Hello from OpenAI",
      model: "gpt-4o-mini",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-openai-key",
        }),
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Say hello" }],
        }),
      }),
    );
  });

  it("rejects a query without a prompt", async () => {
    const response = await request(app).post("/models/query").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "prompt must be a non-empty string" });
  });

  it("returns a configuration error when the API key is missing", async () => {
    const response = await request(app)
      .post("/models/query")
      .send({ prompt: "Hello" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "OPENROUTER_API_KEY is not configured",
    });
  });

  it("returns a configuration error when the OpenAI API key is missing", async () => {
    const response = await request(app)
      .post("/models/query")
      .send({ provider: "openai", prompt: "Hello" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "OPENAI_API_KEY is not configured",
    });
  });

  it("rejects an unknown provider", async () => {
    const response = await request(app)
      .post("/models/query")
      .send({ provider: "anthropic", prompt: "Hello" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "provider must be openrouter or openai",
    });
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const response = await request(app).get("/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Not found" });
  });
});
