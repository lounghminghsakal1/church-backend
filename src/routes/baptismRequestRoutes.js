import express from "express";
import { createBaptismRequest, updateBaptismRequest, getOneBaptismRequest, getAllBaptismRquests, cancelBaptismRequest } from "../controllers/baptsimRequestController.js";
import { authUserMiddleWare } from "../middlewares/authMiddlewares.js";

const baptismRequestRouter = express.Router();

baptismRequestRouter.post("", authUserMiddleWare, createBaptismRequest);

baptismRequestRouter.get("/:baptism_request_id", authUserMiddleWare, getOneBaptismRequest);

baptismRequestRouter.patch("/:baptism_request_id", authUserMiddleWare, updateBaptismRequest);

baptismRequestRouter.get("", authUserMiddleWare, getAllBaptismRquests);

baptismRequestRouter.post("/:baptism_request_id/cancel", authUserMiddleWare, cancelBaptismRequest);

export default baptismRequestRouter;