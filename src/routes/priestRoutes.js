import express from "express";
import { createPriest, updatePriest, getAllPendingBaptismRquests, reviewBaptismRequest } from "../controllers/priestController.js";
import { authPriestMiddleware } from "../middlewares/authMiddlewares.js";

const priestRouter = express.Router();

// POST - /api/priest
priestRouter.post("/", authPriestMiddleware, createPriest); // Oru priest than innoru priest ah create panna mudium , wow 

priestRouter.put("/:priest_id", authPriestMiddleware, updatePriest);

priestRouter.get("/baptism_requests", authPriestMiddleware, getAllPendingBaptismRquests);

priestRouter.post("/baptism_requests/:baptism_request_id", authPriestMiddleware, reviewBaptismRequest);


export default priestRouter;