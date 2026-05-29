import express from "express";
import { createPriest, updatePriest } from "../controllers/priestController.js";
import { authPriestMiddleware } from "../middlewares/authMiddlewares.js";

const priestRouter = express.Router();

// POST - /api/priest
priestRouter.post("/", authPriestMiddleware, createPriest); // Oru priest than innoru priest ah create panna mudium , wow 

priestRouter.put("/:priest_id", authPriestMiddleware, updatePriest);

export default priestRouter;