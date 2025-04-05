import { expect } from 'chai';
import request from 'supertest';
import { app } from '../server'; 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe("Dashboard API", () => {
  before(async () => {
    // Set up a test database connection if needed
  });

  after(async () => {
    // Clean up any data if needed after tests
    await prisma.product.deleteMany();
    await prisma.order.deleteMany();
  });

  it("should return dashboard stats successfully", async () => {
    // Seed the database with some test data for testing
    const product = await prisma.product.create({
      data: { name: 'Test Product', description: 'Test Description', price: 100, image: 'image_url' }
    });

    const order = await prisma.order.create({
      data: { productId: product.id, quantity: 2, totalPrice: 200 }
    });


    // Test the dashboard endpoint
    const res = await request(app).get('/dashboard'); // Assuming the dashboard route is set to '/dashboard'

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('totalOrders');
    expect(res.body).to.have.property('totalProducts');
    expect(res.body).to.have.property('totalUsers');
    expect(res.body).to.have.property('latestProducts');
    expect(res.body).to.have.property('latestOrders');
    expect(res.body.totalOrders).to.be.a('number');
    expect(res.body.totalProducts).to.be.a('number');
    expect(res.body.totalUsers).to.be.a('number');
    expect(res.body.latestProducts).to.be.an('array');
    expect(res.body.latestOrders).to.be.an('array');
  });

  it("should handle errors gracefully", async () => {
    // Simulate a database failure by temporarily disconnecting Prisma or throwing an error in the controller
    const mockPrisma = {
      product: {
        count: () => {
          throw new Error("Database error");
        },
      },
    };

    // Mock the Prisma client method in the controller if needed
    const res = await request(app).get('/dashboard');

    expect(res.status).to.equal(500);
    expect(res.body.message).to.equal('Error fetching dashboard stats');
  });
});
