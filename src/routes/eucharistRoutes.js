import express from "express";
import { authUser } from "../middlewares/authMiddlewares.js";
import { cancelEucharistRequest, createEucharistRequest, getAllEucharistRequests, getOneEucharistRequest, updateEucharistRequest } from "../controllers/eucharistController.js";

const eucharistRouter = express.Router();

eucharistRouter.post("/", authUser, createEucharistRequest);

eucharistRouter.patch("/:eucharist_request_id", authUser, updateEucharistRequest);

eucharistRouter.get("/:eucharist_request_id", authUser, getOneEucharistRequest);

eucharistRouter.get("/", authUser, getAllEucharistRequests);

eucharistRouter.patch("/:eucharist_request_id", authUser, cancelEucharistRequest);

export default eucharistRouter;
