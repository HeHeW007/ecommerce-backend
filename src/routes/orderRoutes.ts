import express from "express";
import { getOrders, getOrderById, createOrder, updateOrder, deleteOrder } from "../controllers/orderController";
import { updateOrderStatus } from "../controllers/orderController";

const router = express.Router();
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

// Route to update the order status
router.put('/:id/status', updateOrderStatus);


export default router;
