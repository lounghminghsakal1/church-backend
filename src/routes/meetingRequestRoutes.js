import express from "express";
import { authUserMiddleWare } from "../middlewares/authMiddlewares.js";
import { createMeetingRequest, updateMeetingRequest, getOneMeetingRequest, getAllMeetingrequests, cancelMeetingRequest } from "../controllers/meetingRequestController.js";

const meetingRequestRouter = express.Router();

meetingRequestRouter.post("/", authUserMiddleWare, createMeetingRequest);

meetingRequestRouter.patch("/:meeting_request_id", authUserMiddleWare, updateMeetingRequest)

meetingRequestRouter.get("/:meeting_request_id", authUserMiddleWare, getOneMeetingRequest);

meetingRequestRouter.get("/", authUserMiddleWare, getAllMeetingrequests);

meetingRequestRouter.post("/:meeting_request_id/cancel", authUserMiddleWare, cancelMeetingRequest);

export default meetingRequestRouter;


