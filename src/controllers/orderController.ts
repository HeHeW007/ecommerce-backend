import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Get all orders
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: { product: true }, // Include product details
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// ✅ Get order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { product: true },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error("Error retrieving order:", error);
    res.status(500).json({ error: "Failed to retrieve order" });
  }
};

// ✅ Create a new order with auto-calculated totalPrice
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      res.status(400).json({ error: "Product ID and quantity are required" });
      return;
    }

    // Fetch product details
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Calculate total price
    const totalPrice = product.price * quantity;

    // Create order
    const order = await prisma.order.create({
      data: { productId, quantity, totalPrice },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// ✅ Update an order (auto-updates totalPrice)
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { productId, quantity } = req.body;

    const existingOrder = await prisma.order.findUnique({ where: { id: Number(id) } });
    if (!existingOrder) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // If productId is updated, check if product exists
    let totalPrice = existingOrder.totalPrice;
    if (productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      totalPrice = product.price * (quantity || existingOrder.quantity);
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { productId, quantity, totalPrice },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
};

// ✅ Delete an order
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const orderExists = await prisma.order.findUnique({ where: { id: Number(id) } });
    if (!orderExists) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    await prisma.order.delete({ where: { id: Number(id) } });

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
};
