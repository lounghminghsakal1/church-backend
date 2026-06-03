import express from "express";
import { createBaptismRequest, updateBaptismRequest, getOneBaptismRequest, getAllBaptismRquests, cancelBaptismRequest } from "../controllers/baptsimRequestController.js";
import { authUser } from "../middlewares/authMiddlewares.js";

const baptismRequestRouter = express.Router();

baptismRequestRouter.post("", authUser, createBaptismRequest);

baptismRequestRouter.get("/:baptism_request_id", authUser, getOneBaptismRequest);

baptismRequestRouter.patch("/:baptism_request_id", authUser, updateBaptismRequest);

baptismRequestRouter.get("", authUser, getAllBaptismRquests);

baptismRequestRouter.post("/:baptism_request_id/cancel", authUser, cancelBaptismRequest);

export default baptismRequestRouter;