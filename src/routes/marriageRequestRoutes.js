import express from "express";
import { authUserMiddleWare } from "../middlewares/authMiddlewares.js";
import { validateFamilyCardMiddleware } from "../middlewares/generalMiddleWares.js";
import { cancelMarriageRequest, createMarriageRequest, editMarriageRequest, getAllMarriageRequest, getOneMarriageRequest } from "../controllers/marriageRequestController.js";

const marriageRequestRouter = express.Router();

marriageRequestRouter.post("/", authUserMiddleWare, validateFamilyCardMiddleware, createMarriageRequest);

marriageRequestRouter.patch("/:marriage_request_id", authUserMiddleWare, editMarriageRequest);

marriageRequestRouter.get("/:marriage_request_id", authUserMiddleWare, getOneMarriageRequest);

marriageRequestRouter.get("/", authUserMiddleWare, getAllMarriageRequest);

marriageRequestRouter.post("/:marriage_request/cancel", authUserMiddleWare, cancelMarriageRequest);

export default marriageRequestRouter;


