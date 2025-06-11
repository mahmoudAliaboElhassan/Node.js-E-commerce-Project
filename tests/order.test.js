// tests/order.test.js
const request = require("supertest");
const app = require("../index");

// Mock middleware that requires admin (bypass it for testing)
jest.mock("../middlewares/verifyAdmin.js", () => (req, res, next) => next());

describe("Order Routes", () => {
  it("GET /orders - should return all orders", async () => {
    const res = await request(app).get("/api/orders");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.message).toBe("Orders fetched successfully");
    expect(Array.isArray(res.body.data.orders)).toBe(true);
  });

  it("GET /orders/:id - should return 200 if order exists", async () => {
    const existOrder = "681275eff897145499f32e14"; // valid format but not in DB

    const res = await request(app).get(`/api/orders/${existOrder}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.message).toBe("Order fetched successfully");
  });
  it("GET /orders/:id - should return 404 if order not found", async () => {
    const nonExistentId = "60c72b2f9b1e8b5f4d3e7c8a"; // valid format but not in DB

    const res = await request(app).get(`/api/orders/${nonExistentId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.data.error).toBe("Order not found");
  });
  it("PUT /orders/:id - should return 200 if order exists and updated", async () => {
    const existOrder = "681275eff897145499f32e14"; // valid format but not in DB

    const res = await request(app)
      .put(`/api/orders/${existOrder}`)
      .send({ status: "SHIPPED" });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.message).toBe("Order status updated successfully");
  });
  it("PUT /orders/:id - should return 404 if order not found", async () => {
    const nonExistentId = "60c72b2f9b1e8b5f4d3e7c9a";

    const res = await request(app)
      .put(`/api/orders/${nonExistentId}`)
      .send({ status: "SHIPPED" });

    expect(res.statusCode).toBe(404);
    expect(res.body.data.error).toBe("Order not found");
  });
});
