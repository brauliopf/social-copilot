import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./server";

describe("API", () => {
  it("reports channel health", async () => {
    const response = await request(app).get("/channels/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const response = await request(app).get("/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Not found" });
  });
});
