import express from "express";
import { authUserMiddleWare } from "../middlewares/authMiddlewares.js";
import { cancelConfessionRequest, createConfessionRequest, getAllConfesstionRequests, getOneConfessionRequest, updateConfessionRequest } from "../controllers/confessionRequestController.js";

const confessionRouter = express.Router();

confessionRouter.post("/", authUserMiddleWare, createConfessionRequest);

confessionRouter.patch("/:confession_request_id", authUserMiddleWare, updateConfessionRequest);

confessionRouter.get("/", authUserMiddleWare, getAllConfesstionRequests);

confessionRouter.patch("/:confession_request_id", authUserMiddleWare, getOneConfessionRequest);

confessionRouter.patch("/:confession_request_id", authUserMiddleWare, cancelConfessionRequest);

export default confessionRouter;