import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardStats = async (_req: Request, res: Response) => {
  const totalOrders = await prisma.order.count();
  const totalProducts = await prisma.product.count();

  const latestProducts = await prisma.product.findMany({ take: 5, orderBy: { createdAt: "desc" } });
  const latestOrders = await prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { product: true } });

  res.json({ totalOrders, totalProducts, latestProducts, latestOrders });
};


