import request from "supertest";
import app from "../app";

describe("GET /api/health", () => {
  it("devrait répondre avec un status 200 et un message de santé", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "ok");
    expect(response.body).toHaveProperty(
      "message",
      "API films opérationnelle ✅"
    );
  });
});
