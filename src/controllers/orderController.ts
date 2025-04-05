import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body; // 'status' should be either 'Delivered' or 'Pending'
   // Validate status
   if (!['Delivered', 'Pending'].includes(status)) {
    res.status(400).json({ error: "Invalid status. It must be 'Delivered' or 'Pending'" });
    return;
  }

  try {
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

// Get all orders with proper response structure
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: { product: true },
    });

    // Transform response for frontend consistency
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      customer: order.customerName, 
      amount: order.totalPrice, 
      date: order.createdAt.toISOString(),
      productId: order.productId,
    }));

    res.json({ latestOrders: formattedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Get order by ID
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

    res.json({
      id: order.id,
      customer: order.customerName,
      amount: order.totalPrice,
      date: order.createdAt.toISOString(),
      productId: order.productId,
    });
  } catch (error) {
    console.error("Error retrieving order:", error);
    res.status(500).json({ error: "Failed to retrieve order" });
  }
};

// Create a new order with totalPrice auto-calculation
// Create a new order with totalPrice auto-calculation
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, quantity, customerName, status } = req.body;

    // Validate inputs
    if (!productId || !quantity || !customerName) {
      res.status(400).json({ error: "Product ID, quantity, and customer name are required" });
      return;
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Calculate total
    const totalPrice = product.price * quantity;

    // Create order
    const order = await prisma.order.create({
      data: {
        customerName: customerName,
        productId: Number(productId),
        quantity: Number(quantity),
        totalPrice: totalPrice,
        status: status || "Pending", // default to "Pending" if not provided
      },
    });

    // Send success response
    res.status(201).json({
      id: order.id,
      customer: order.customerName,
      amount: order.totalPrice,
      status: order.status,
      date: order.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};


// Update an order
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { productId, quantity, customerName } = req.body;

    const existingOrder = await prisma.order.findUnique({ where: { id: Number(id) } });
    if (!existingOrder) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    let totalPrice = existingOrder.totalPrice;

    // Update total price if product or quantity changes
    if (productId || quantity) {
      const product = await prisma.product.findUnique({ where: { id: productId || existingOrder.productId } });
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      totalPrice = product.price * (quantity || existingOrder.quantity); // Default to existing quantity if not provided
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { 
        productId, 
        quantity, 
        totalPrice, 
        customerName: customerName || existingOrder.customerName, // Ensure customerName updates correctly
      },
    });

    res.json({
      id: updatedOrder.id,
      customer: updatedOrder.customerName,
      amount: updatedOrder.totalPrice,
      date: updatedOrder.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
};

// Delete an order
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
