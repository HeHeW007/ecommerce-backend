import { expect } from "chai";
import request from "supertest";
import {app}  from "../server"; 

describe("🔹 Product API Tests", () => {
  let createdProductId: number; // Store product ID for update & delete tests

  /** ✅ Test GET all products */
  it("should return all products", async () => {
    const res = await request(app).get("/products");
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  /** ✅ Test POST create a new product */
  it("should create a new product", async () => {
    const newProduct = {
      name: "Test Product",
      description: "This is a test product",
      price: 100.99,
      image: "test-image.jpg",
    };

    const res = await request(app).post("/products").send(newProduct);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");

    createdProductId = res.body.id; // Store the created product ID for later tests
    expect(res.body.name).to.equal(newProduct.name);
  });

  /** ✅ Test GET product by ID */
  it("should return a single product by ID", async () => {
    const res = await request(app).get(`/products/${createdProductId}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("id", createdProductId);
  });

  /** ❌ Test GET non-existing product */
  it("should return 404 for a non-existing product", async () => {
    const res = await request(app).get("/products/9999"); // Assuming ID 9999 does not exist
    expect(res.status).to.equal(404);
  });

  /** ✅ Test PUT update a product */
  it("should update an existing product", async () => {
    const updatedData = {
      name: "Updated Product",
      description: "Updated description",
      price: 120.50,
      image: "updated-image.jpg",
    };

    const res = await request(app).put(`/products/${createdProductId}`).send(updatedData);
    expect(res.status).to.equal(200);
    expect(res.body.name).to.equal(updatedData.name);
  });

  /** ✅ Test DELETE product */
  it("should delete a product", async () => {
    const res = await request(app).delete(`/products/${createdProductId}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Product deleted successfully");
  });

  /** ❌ Test DELETE non-existing product */
  it("should return 404 when trying to delete a non-existing product", async () => {
    const res = await request(app).delete("/products/9999"); // Assuming ID 9999 does not exist
    expect(res.status).to.equal(404);
  });
});
