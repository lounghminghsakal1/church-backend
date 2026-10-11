import mongoose from "mongoose";
import { isAnnouncementUrl } from "../utils/announcementUtils.js";

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  image_url: {
    type: String, trim: true, default: "",
    validate: { validator: isAnnouncementUrl, message: "Invalid image URL" },
  },
  link: {
    type: String, trim: true, default: "",
    validate: { validator: isAnnouncementUrl, message: "Invalid link URL" },
  },
  start_date: { type: Date, required: true },
  end_date: {
    type: Date, required: true,
    validate: {
      validator(value) { return !this.start_date || value >= this.start_date; },
      message: "end_date must be on or after start_date",
    },
  },
  status: { type: String, enum: ["active", "inactive"], default: "active", required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Priest", required: true },
}, { timestamps: true, optimisticConcurrency: true });

AnnouncementSchema.index({ status: 1, start_date: -1, end_date: 1 });
AnnouncementSchema.index({ created_by: 1, createdAt: -1 });

export default mongoose.model("Announcement", AnnouncementSchema);
