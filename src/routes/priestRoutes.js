import express from "express";
import { createPriest, updatePriest, getAllPendingBaptismRquests, reviewBaptismRequest, getAllPendingEucharistRequests, reviewEucharistRequest, getAllPendingConfessionRquests, reviewConfessionRequest, getAllPendingMeetingRequests, reviewMeetingRequest, getAllPendingConfirmationRequest, reviewConfirmationRequest, getAllPendingMassPrayers, reviewMassPrayer } from "../controllers/priestController.js";
import { authPriestMiddleware } from "../middlewares/authMiddlewares.js";

const priestRouter = express.Router();

// POST - /api/priest
priestRouter.post("/", authPriestMiddleware, createPriest); // Oru priest than innoru priest ah create panna mudium , wow 

priestRouter.put("/:priest_id", authPriestMiddleware, updatePriest);

priestRouter.get("/baptism_requests", authPriestMiddleware, getAllPendingBaptismRquests);

priestRouter.post("/baptism_requests/:baptism_request_id", authPriestMiddleware, reviewBaptismRequest);


priestRouter.get("/eucharist_requests", authPriestMiddleware, getAllPendingEucharistRequests);

priestRouter.post("/eucharist_requests/:eucharist_request_id", authPriestMiddleware, reviewEucharistRequest)


priestRouter.get("/confession_requests", authPriestMiddleware, getAllPendingConfessionRquests);

priestRouter.post("/confession_requests/:confession_request_id", authPriestMiddleware, reviewConfessionRequest);

priestRouter.get("/meeting_requests", authPriestMiddleware, getAllPendingMeetingRequests);

priestRouter.post("/meeting_requests/:meeting_request_id", authPriestMiddleware, reviewMeetingRequest);

priestRouter.get("/confirmation_requests", authPriestMiddleware, getAllPendingConfirmationRequest);

priestRouter.post("/confirmation_requests/:confirmation_request_id", authPriestMiddleware, reviewConfirmationRequest);

priestRouter.get("/mass_prayers", authPriestMiddleware, getAllPendingMassPrayers);

priestRouter.post("/mass_prayer/:mass_prayer_id", authPriestMiddleware, reviewMassPrayer);

export default priestRouter;