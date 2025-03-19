import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ✅ Middleware to handle async errors
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// ✅ Insert Sample Data on Startup
const insertSampleData = async () => {
  try {
    const existingProducts = await prisma.product.findMany();
    if (existingProducts.length === 0) {
      await prisma.product.create({
        data: {
          name: "Sample Product",
          description: "This is a sample product.",
          price: 99.99,
        },
      });
      console.log("✅ Sample data inserted into database.");
    }
  } catch (error) {
    console.error("❌ Error inserting sample data:", error);
  }
};

// ✅ Get all products
app.get(
  "/products",
  asyncHandler(async (req: Request, res: Response) => {
    const products = await prisma.product.findMany();
    res.json(products);
  })
);

// ✅ Get a single product by ID
app.get(
  "/products/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  })
);

// ✅ Create a new product
app.post(
  "/products",
  asyncHandler(async (req: Request, res: Response) => {
    const { name, description, price } = req.body;

    if (!name || !description || price === undefined) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const product = await prisma.product.create({
      data: { name, description, price },
    });

    res.status(201).json(product);
  })
);

// ✅ Update a product
app.put(
  "/products/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, price } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, description, price },
    });

    res.json(updatedProduct);
  })
);

// ✅ Delete a product
app.delete(
  "/products/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Product deleted successfully" });
  })
);

// ✅ Global Error Handler Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await insertSampleData(); // ✅ Insert sample data on startup
});
