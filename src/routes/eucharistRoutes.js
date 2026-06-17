import express from "express";
import { authUserMiddleWare } from "../middlewares/authMiddlewares.js";
import { cancelEucharistRequest, createEucharistRequest, getAllEucharistRequests, getOneEucharistRequest, updateEucharistRequest } from "../controllers/eucharistRequestController.js";
import { validateFamilyCardMiddleware } from "../middlewares/generalMiddleWares.js";

const eucharistRouter = express.Router();

eucharistRouter.post("/", authUserMiddleWare, validateFamilyCardMiddleware ,createEucharistRequest);

eucharistRouter.patch("/:eucharist_request_id", authUserMiddleWare, updateEucharistRequest);

eucharistRouter.get("/:eucharist_request_id", authUserMiddleWare, getOneEucharistRequest);

eucharistRouter.get("/", authUserMiddleWare, getAllEucharistRequests);

eucharistRouter.post("/:eucharist_request_id/cancel", authUserMiddleWare, cancelEucharistRequest);

export default eucharistRouter;
