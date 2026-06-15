import mongoose from "mongoose";
import { editPriestAllowedFields } from "../constants/priestConstants.js";
import BaptismRequest from "../models/BaptismRequest.js";
import EucharistRequest from "../models/EucharistRequest.js";
import Priest from "../models/Priest.js";
import { checkIsthereInvalidFields, failureResponse, pickAllowedFields, successResponse, validateIdAndGiveThatDocument } from "../utils/generalHelpers.js";
import { validateCreatePriestData, validateUpdatePriestPayload, validateReviewBaptismRequestPayload, validateReviewEucharistRequestPayload, validateReviewConfessionRequest } from "../utils/priestUtils.js";
import bcrypt from "bcrypt";
import ConfessionRequest from "../models/ConfessionRequest.js";
import MeetingRequest from "../models/MeetingRequest.js";

export const createPriest = async (req, res) => {
  try {
    const createPriestPayload = req.body;

    await validateCreatePriestData(createPriestPayload);

    const hashedPassword = await bcrypt.hash(createPriestPayload.priest_password, 10);
    createPriestPayload.priest_password = hashedPassword;

    const savedPriestData = await Priest.create(createPriestPayload);

    const savedPriestAsObject = savedPriestData.toObject();

    delete savedPriestAsObject.priest_password;

    res.status(201).json({
      status: "success",
      message: "Priest created successfully",
      data: savedPriestAsObject
    });

  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: `Failed to create priest: ${err.message}`
    });
  }
}

export const updatePriest = async (req, res) => {
  try {
    await validateUpdatePriestPayload(req);

    const filteredUpdates = pickAllowedFields(editPriestAllowedFields, req.body);
    const updatedPriest = await Priest.findOneAndUpdate({ _id: req.params.priest_id }, filteredUpdates, { new: true, runValidators: true });
    res.json({
      status: "success",
      message: "Priest data updated successfully",
      data: updatedPriest
    });
  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to update priest data: " + err.message
    });
  }
}

// Baptism requests management

export const getAllPendingBaptismRquests = async (req, res) => {
  try {
    const allPendingBaptismRequests = await BaptismRequest.find({ status: "pending" }).populate("user", ["user_name", "user_email", "user_mobile_number", "prayer_group"]);
    res.json({
      status: "success",
      message: "All pending baptism requests have been fetched succeessfully",
      data: allPendingBaptismRequests
    });

  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to fetch all pending baptism requests: " + err.message
    });
  }
}

export const reviewBaptismRequest = async (req, res) => {
  try {
    const baptismRequestId = req.params.baptism_request_id;
    if (!baptismRequestId) {
      throw new Error("Baptism request id is required");
    }
    if (!mongoose.Types.ObjectId.isValid(baptismRequestId)) {
      throw new Error("Invalid id");
    }
    const baptismRequest = await BaptismRequest.findById(baptismRequestId);
    if (!baptismRequest) {
      throw new Error("baptism request not found");
    }
    validateReviewBaptismRequestPayload(req.body);
    if (req.body.status !== "approved" && req.body.status !== "rejected") {
      return res.status(422).json({
        status: "failure",
        message: "Invalid status"
      });
    }
    const allowedPayload = pickAllowedFields(["status", "priest_response"], req.body);
    const updatedBaptismRequest = await BaptismRequest.findByIdAndUpdate(baptismRequestId, allowedPayload, { new: true, runValidators: true });
    res.json({
      status: "success",
      message: "Baptism request " + req.body.status + " successfully",
      data: updatedBaptismRequest
    });
  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to review the baptism request " + err.message
    });
  }
}


// Eucharist request Management
export const getAllPendingEucharistRequests = async (req, res) => {
  try {
    const allPendingEucharistRequests = await EucharistRequest.find({ status: "pending" }).populate("user", ["user_name", "user_email", "user_mobile_number", "family_card_document"]);
    res.json({
      status: "success",
      message: "All pending eucharist requests are fetched successfully",
      data: allPendingEucharistRequests
    });
  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to fetch all pending eucharist requests"
    });
  }
}

export const reviewEucharistRequest = async (req, res) => {
  try {
    const euchartistRequestId = req.params.eucharist_request_id;
    if (!euchartistRequestId) {
      throw new Error("Eucharist request id present");
    }
    if (!mongoose.Types.ObjectId.isValid(euchartistRequestId)) {
      throw new Error("Invalid id");
    }
    const eucharistRequest = await EucharistRequest.findById(euchartistRequestId);
    if (!eucharistRequest) {
      throw new Error("Eucharist request not found");
    }
    validateReviewEucharistRequestPayload(req.body);
    if (req.body.status !== "approved" && req.body.status !== "rejected") {
      return res.status(422).json({
        status: "failure",
        message: "Invalid status"
      });
    }
    const filteredPayload = pickAllowedFields(["status", "priest_response"], req.body);
    const reviewedEucharistRequest = await EucharistRequest.findByIdAndUpdate(euchartistRequestId, filteredPayload, { new: true });
    res.json({
      status: "success",
      message: `Eucharist request ${req.body.status} successfully`,
      data: reviewedEucharistRequest
    });
  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to review eucharist request, " + err.message
    });
  }
}


export const getAllPendingConfessionRquests = async (req, res) => {
  try {
    const allPendinConfessionRequests = await ConfessionRequest.find({ status: "pending" }).populate("user", ["user_name", "user_email", "user_mobile_number"]);
    res.json(successResponse("All pending confession requests are fetched successfully", allPendinConfessionRequests));
  } catch (err) {
    res.json(failureResponse("Falied to fetch all pending confession requests, " + err.message));
  }
}

export const reviewConfessionRequest = async (req, res) => {
  try {
    const confessionRequestId = req.params.confession_request_id;
    if (!confessionRequestId) throw new Error("Confesstion request id required");
    const confessionRequest = await validateIdAndGiveThatDocument(confessionRequestId, ConfessionRequest);
    validateReviewConfessionRequest(req.body);
    if (req.body.status !== "approved" && req.body.status !== "rejected") {
      throw new Error("Invalid status");
    }
    const filteredPayload = pickAllowedFields(["status", "priest_response"], req.body);
    const reviewedConfessionRequest = await ConfessionRequest.findByIdAndUpdate(confessionRequestId, filteredPayload, { new: true });
    res.json(successResponse(`Confession request ${req.body.status} successfully`, reviewedConfessionRequest))
  } catch (err) {
    res.status(400).json(failureResponse(`Failed to review confession request, ${err.message}`));
  }
}

export const getAllPendingMeetingRequests = async (req, res) => {
  try {
    const allPendingMeetingRequests = await MeetingRequest.find({ status: "pending" }).populate("user", ["user_name", "user_email", "user_mobile_number"]);
    res.json(successResponse("All pending meeting requests are fetched successfully", allPendingMeetingRequests));
  } catch (err) {
    res.status(400).json(failureResponse("Failed to fetch all pending meeting requests, " + err.message));
  }
}

export const reviewMeetingRequest = async (req, res) => {
  try {
    const meetingRequestId = req.params.meeting_request_id;
    if(!meetingRequestId) throw new Error("Meeting request id is required");
    const meetingRequest = await validateIdAndGiveThatDocument(meetingRequestId, MeetingRequest);
    if(meetingRequest.status !== "pending") throw new Error("Only meeting request with pending status can be reviewed");
    checkIsthereInvalidFields(["status", "priest_response"], req.body);
    if(req.body.status !== "approved" && req.body.status !== "rejected") throw new Error("Invalid status");
    const filteredPayload = pickAllowedFields(["status", "priest_response"], req.body);
    const reviewedMeetingRequest = await MeetingRequest.findByIdAndUpdate(meetingRequestId, filteredPayload, {new:true});
    res.json(successResponse("Meeting request "+req.body.status+ " successfully"));
  } catch (err) {
    res.status(400).json(failureResponse("Failed to review meeting request, "+err.message));
  }
}