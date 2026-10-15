import express from "express";
import { authPriestMiddleware } from "../middlewares/authMiddlewares.js";
import {
  createAnnouncement, getPriestAnnouncements, getPriestAnnouncement,
  updateAnnouncement, deleteAnnouncement, getVisibleAnnouncements, getVisibleAnnouncement,
} from "../controllers/announcementController.js";

export const priestAnnouncementRouter = express.Router();
priestAnnouncementRouter.use(authPriestMiddleware);
priestAnnouncementRouter.post("/", createAnnouncement);
priestAnnouncementRouter.get("/", getPriestAnnouncements);
priestAnnouncementRouter.get("/:announcement_id", getPriestAnnouncement);
priestAnnouncementRouter.patch("/:announcement_id", updateAnnouncement);
priestAnnouncementRouter.delete("/:announcement_id", deleteAnnouncement);

export const userAnnouncementRouter = express.Router();
userAnnouncementRouter.get("/", getVisibleAnnouncements);
userAnnouncementRouter.get("/:announcement_id", getVisibleAnnouncement);
