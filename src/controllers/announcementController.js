import mongoose from "mongoose";
import Announcement from "../models/Announcement.js";
import { failureResponse, successResponse } from "../utils/generalHelpers.js";
import { validateAnnouncementPayload, visibleAnnouncementFilter } from "../utils/announcementUtils.js";

const validId = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.announcement_id)) {
    res.status(400).json(failureResponse("Invalid announcement id"));
    return false;
  }
  return true;
};

export const createAnnouncement = async (req, res) => {
  let payload;
  try {
    payload = validateAnnouncementPayload(req.body);
  } catch (err) {
    return res.status(400).json(failureResponse(err.message));
  }
  try {
    const announcement = await Announcement.create({ ...payload, created_by: req.priest._id });
    return res.status(201).json(successResponse("Announcement created successfully", announcement));
  } catch (err) {
    return res.status(500).json(failureResponse("Failed to create announcement"));
  }
};

export const getPriestAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ created_by: req.priest._id }).sort({ createdAt: -1 });
    return res.json(successResponse("Announcements fetched successfully", announcements));
  } catch (err) {
    return res.status(500).json(failureResponse("Failed to fetch announcements"));
  }
};

export const getPriestAnnouncement = async (req, res) => {
  if (!validId(req, res)) return;
  try {
    const announcement = await Announcement.findOne({
      _id: req.params.announcement_id, created_by: req.priest._id,
    });
    if (!announcement) return res.status(404).json(failureResponse("Announcement not found"));
    return res.json(successResponse("Announcement fetched successfully", announcement));
  } catch (err) {
    return res.status(500).json(failureResponse("Failed to fetch announcement"));
  }
};

export const updateAnnouncement = async (req, res) => {
  if (!validId(req, res)) return;
  try {
    const announcement = await Announcement.findOne({
      _id: req.params.announcement_id, created_by: req.priest._id,
    });
    if (!announcement) return res.status(404).json(failureResponse("Announcement not found"));
    let payload;
    try {
      payload = validateAnnouncementPayload(req.body, announcement.toObject());
    } catch (err) {
      return res.status(400).json(failureResponse(err.message));
    }
    announcement.set(payload);
    await announcement.save();
    return res.json(successResponse("Announcement updated successfully", announcement));
  } catch (err) {
    if (err.name === "VersionError") {
      return res.status(409).json(failureResponse("Announcement changed; reload it before editing"));
    }
    return res.status(500).json(failureResponse("Failed to update announcement"));
  }
};

export const deleteAnnouncement = async (req, res) => {
  if (!validId(req, res)) return;
  try {
    const announcement = await Announcement.findOneAndDelete({
      _id: req.params.announcement_id, created_by: req.priest._id,
    });
    if (!announcement) return res.status(404).json(failureResponse("Announcement not found"));
    return res.json(successResponse("Announcement deleted successfully"));
  } catch (err) {
    return res.status(500).json(failureResponse("Failed to delete announcement"));
  }
};

export const getVisibleAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find(visibleAnnouncementFilter()).sort({ start_date: -1, createdAt: -1 });
    return res.json(successResponse("Announcements fetched successfully", announcements));
  } catch (err) {
    return res.status(500).json(failureResponse("Failed to fetch announcements"));
  }
};

export const getVisibleAnnouncement = async (req, res) => {
  if (!validId(req, res)) return;
  try {
    const announcement = await Announcement.findOne({
      _id: req.params.announcement_id, ...visibleAnnouncementFilter(),
    });
    if (!announcement) return res.status(404).json(failureResponse("Announcement not found"));
    return res.json(successResponse("Announcement fetched successfully", announcement));
  } catch (err) {
    return res.status(500).json(failureResponse("Failed to fetch announcement"));
  }
};
