import express from "express";
import { authUserMiddleWare } from "../middlewares/authMiddlewares.js";
import { cancelAnointingOfTheSickRequest, createAnointingOfTheSickRequest, editAnointingOfTheSickRequest, getAllAnointingOfTheSickRequest, getOneAnointingOfTheSickRequest } from "../controllers/anointingOfTheRequestController.js";

const anoinTingOfTheSickRouter = express.Router();

anoinTingOfTheSickRouter.post("/", authUserMiddleWare, createAnointingOfTheSickRequest);

anoinTingOfTheSickRouter.patch("/:aos_request_id", authUserMiddleWare, editAnointingOfTheSickRequest);

anoinTingOfTheSickRouter.get("/:aos_request_id", authUserMiddleWare, getOneAnointingOfTheSickRequest);

anoinTingOfTheSickRouter.get("/", authUserMiddleWare, getAllAnointingOfTheSickRequest);

anoinTingOfTheSickRouter.post("/:aos_request_id/cancel", authUserMiddleWare, cancelAnointingOfTheSickRequest);


export default anoinTingOfTheSickRouter;