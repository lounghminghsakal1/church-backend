import express from "express";
import { authenticateMediaUpload, parseS3Media } from "../middlewares/mediaUploadMiddleware.js";
import { uploadS3Media } from "../controllers/mediaUploadController.js";

const s3MediaRouter = express.Router();
s3MediaRouter.post("/", authenticateMediaUpload, parseS3Media, uploadS3Media);

export default s3MediaRouter;
