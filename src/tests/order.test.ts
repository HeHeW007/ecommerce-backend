import request from "supertest"; // For making HTTP requests in tests
import { app } from "../server"; // Import your app instance
import { expect } from "chai"; // Chai for assertions

describe("Order API", () => {
  
  // Sample order data to use for POST and PUT tests
  const newOrder = {
    productId: 1,
    quantity: 2,
    totalPrice: 199.98,
    status: "pending",
  };

  let orderId: number; // To store the ID of the order created in the POST request

  // Test GET /orders
  it("should get all orders", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array"); // Ensure the response is an array
  });

  // Test POST /orders
  it("should create a new order", async () => {
    const res = await request(app).post("/api/orders").send(newOrder);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
    expect(res.body.productId).to.equal(newOrder.productId);
    expect(res.body.quantity).to.equal(newOrder.quantity);
    orderId = res.body.id; // Store the order ID for further tests
  });

  // Test GET /orders/:id
  it("should get a single order by ID", async () => {
    const res = await request(app).get(`/api/orders/${orderId}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("id", orderId);
    expect(res.body.productId).to.equal(newOrder.productId);
  });

  // Test PUT /orders/:id
  it("should update an order", async () => {
    const updatedOrder = {
      ...newOrder,
      status: "shipped", // Change the status
    };

    const res = await request(app).put(`/api/orders/${orderId}`).send(updatedOrder);
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal(updatedOrder.status);
  });

  // Test DELETE /orders/:id
  it("should delete an order", async () => {
    const res = await request(app).delete(`/api/orders/${orderId}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Order deleted successfully");
  });
});
