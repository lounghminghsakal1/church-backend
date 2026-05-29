import express from "express";
import { createPriestavailability, getAllPriestAvailability, getPriestAvailabilityById, editPriestAvailability } from "../controllers/priestAvailabilityController.js";
import { authPriestMiddleware } from "../middlewares/authMiddlewares.js";

const priestAvailabilityRouter = express.Router();

// GET - /api/priest-availability (all priests availability)
priestAvailabilityRouter.get("/", getAllPriestAvailability);

// GET - /api/priest-availability/:priestId (specific priest's availability status)
priestAvailabilityRouter.get("/:priest_id", getPriestAvailabilityById);

// POST - /api/priest-availability
priestAvailabilityRouter.post("/", authPriestMiddleware, createPriestavailability);

priestAvailabilityRouter.put("/:priest_availability_id", authPriestMiddleware, editPriestAvailability);


export default priestAvailabilityRouter;
