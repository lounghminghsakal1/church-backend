import express from "express";
import { authUserMiddleWare } from "../middlewares/authMiddlewares.js";
import { cancelEucharistRequest, createEucharistRequest, getAllEucharistRequests, getOneEucharistRequest, updateEucharistRequest } from "../controllers/eucharistController.js";

const eucharistRouter = express.Router();

eucharistRouter.post("/", authUserMiddleWare, createEucharistRequest);

eucharistRouter.patch("/:eucharist_request_id", authUserMiddleWare, updateEucharistRequest);

eucharistRouter.get("/:eucharist_request_id", authUserMiddleWare, getOneEucharistRequest);

eucharistRouter.get("/", authUserMiddleWare, getAllEucharistRequests);

eucharistRouter.patch("/:eucharist_request_id", authUserMiddleWare, cancelEucharistRequest);

export default eucharistRouter;
