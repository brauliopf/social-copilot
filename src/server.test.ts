import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "./server";

describe("API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
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

  it("returns a JSON 404 for unknown routes", async () => {
    const response = await request(app).get("/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Not found" });
  });
});
