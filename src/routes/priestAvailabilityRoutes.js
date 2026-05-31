import express from "express";
import { createPriestavailability, getAllPriestAvailability, getPriestAvailabilityById, editPriestAvailability } from "../controllers/priestAvailabilityController.js";
import { authPriestMiddleware } from "../middlewares/authMiddlewares.js";

const priestAvailabilityRouter = express.Router();

// GET - /api/priest_availability (all priests availability) - for public view so no need of authMiddleware
priestAvailabilityRouter.get("/", getAllPriestAvailability);

// GET - /api/priest_availability/:priestId (specific priest's availability status) - for public view so no need of authPriestMiddleware
priestAvailabilityRouter.get("/:priest_id", getPriestAvailabilityById);

// POST - /api/priest_availability - priest can update their availability so need of authPriestMiddleware to know whether this api call is made by priest or not because logged in priest has token and authPriestMiddleware validating token and attaches loggedInPriest to req object
priestAvailabilityRouter.post("/", authPriestMiddleware, createPriestavailability);

// POST - /api/priest_availability/:priest_availability_id - need authPriestMiddleware because -> read above api's comment
priestAvailabilityRouter.put("/:priest_availability_id", authPriestMiddleware, editPriestAvailability);


export default priestAvailabilityRouter;
