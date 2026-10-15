import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import Priest from "../models/Priest.js";
import User from "../models/User.js";
import { MAX_MEDIA_SIZE, mediaMimeTypes } from "../constants/mediaConstants.js";
import { failureResponse } from "../utils/generalHelpers.js";

export const authenticateMediaUpload = async (req, res, next) => {
  req.mediaActors = {};
  for (const [role, cookie, claim, Model] of [
    ["priest", "token", "priestId", Priest],
    ["user", "userToken", "userId", User],
  ]) {
    const token = req.cookies?.[cookie];
    if (!token) continue;
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!mongoose.Types.ObjectId.isValid(decoded[claim])) continue;
    } catch {
      continue;
    }
    try {
      const actor = await Model.findById(decoded[claim]).select("_id");
      if (actor) req.mediaActors[role] = actor._id;
    } catch {
      return res.status(503).json(failureResponse("Unable to verify upload session"));
    }
  }
  if (!Object.keys(req.mediaActors).length) {
    return res.status(401).json(failureResponse("Please login before uploading media"));
  }
  next();
};

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MEDIA_SIZE, files: 1, fields: 2, fieldSize: 128 },
  fileFilter(req, file, cb) {
    if (!mediaMimeTypes[file.mimetype]) return cb(new Error("Only PNG, JPEG and PDF files are allowed"));
    cb(null, true);
  },
}).single("file");

export const parseS3Media = (req, res, next) => {
  uploader(req, res, err => {
    if (err) {
      const tooLarge = err.code === "LIMIT_FILE_SIZE";
      return res.status(tooLarge ? 413 : 400).json(failureResponse(
        tooLarge ? "File must not exceed 5 MiB" : err.message
      ));
    }
    next();
  });
};
