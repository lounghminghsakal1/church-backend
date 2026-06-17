import exp from "express";
import { validateFamilyCardMiddleware } from "../middlewares/generalMiddleWares.js";
import { authUserMiddleWare } from "../middlewares/authMiddlewares.js";
import { cancelConfirmationRequest, createConfirmationRequest, getAllConfirmationRequests, getOneConfirmationRequest, updateConfirmationRequest } from "../controllers/confirmationRequestController.js";

const confirmationRequestRouter = exp.Router();

confirmationRequestRouter.post("/", authUserMiddleWare ,validateFamilyCardMiddleware, createConfirmationRequest);

confirmationRequestRouter.patch("/:confirmation_request_id", authUserMiddleWare, validateFamilyCardMiddleware, updateConfirmationRequest);

confirmationRequestRouter.get("/:confirmation_request_id", authUserMiddleWare, validateFamilyCardMiddleware, getOneConfirmationRequest);

confirmationRequestRouter.get("/", authUserMiddleWare, validateFamilyCardMiddleware, getAllConfirmationRequests);

confirmationRequestRouter.post("/:confirmation_request_id/cancel", authUserMiddleWare, validateFamilyCardMiddleware, cancelConfirmationRequest);

export default confirmationRequestRouter;

