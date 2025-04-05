import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching products:", error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const productId = Number(id);

    if (isNaN(productId)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error retrieving product:", error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error("Error retrieving product:", error);
      res.status(500).json({ error: "Error retrieving product" });
    }
  }
};

// Create a new product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, image } = req.body;

    // Validation: Ensure required fields are present
    if (!name || !description || !price || !image) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Validate price is a number and positive
    if (isNaN(price) || price <= 0) {
      res.status(400).json({ error: "Price must be a positive number" });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        image,
        updatedAt: new Date(),
      },
    });

    res.status(201).json(product);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating product:", error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, image } = req.body;

    const productId = Number(id);
    if (isNaN(productId)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    // Ensure at least one field is being updated
    const updateData: any = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (image) updateData.image = image;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    updateData.updatedAt = new Date();

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    res.json(updatedProduct);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating product:", error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const productId = Number(id);

    if (isNaN(productId)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    await prisma.product.delete({ where: { id: productId } });

    res.json({ message: "Product deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error deleting product:", error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  }
};
