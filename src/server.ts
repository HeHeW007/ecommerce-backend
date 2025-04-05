import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import { updateOrderStatus } from "./controllers/orderController";

// Initialize dotenv to load environment variables
dotenv.config();
const app = express();
const prisma = new PrismaClient();

// Enable CORS for frontend
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true, // Allow cookies and authentication headers
  })
);

app.use(express.json());

// Middleware to handle async errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Insert sample data on startup
const insertSampleData = async () => {
  try {
    const existingProducts = await prisma.product.findMany();
    if (existingProducts.length === 0) {
      await prisma.product.create({
        data: {
          name: "Sample Product",
          description: "This is a sample product.",
          price: 99.99,
          image: ""
        },
      });
      console.log("✅ Sample data inserted into database.");
    }
  } catch (error) {
    console.error("❌ Error inserting sample data:", error);
  }
};

// Routes
app.use("/api/products", productRoutes); // Prefixed with /api
app.use("/api/orders", orderRoutes); // Prefixed with /api
app.use("/api/dashboard", dashboardRoutes); // Prefixed with /api

// Global Error Handler Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;

// Routes
app.put("/api/orders/:id/status", updateOrderStatus); // Endpoint for updating the status of an order

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await insertSampleData(); // Insert sample data on startup
});

export { app };