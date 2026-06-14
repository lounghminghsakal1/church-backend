import { createAndEditConfessionRequestAllowedAndRequiredFields } from "../constants/confessionRequestConstants.js";
import ConfessionRequest from "../models/ConfessionRequest.js";
import { failureResponse, pickAllowedFields, successResponse, validateIdAndGiveThatDocument } from "../utils/generalHelpers.js";
import { validateCreateConfessionRequestPayload, validateUpdateConfessionRequestPayload } from "../utils/confessionRequestUtils.js";
import mongoose from "mongoose";

export const createConfessionRequest = async (req, res) => {
  try {
    validateCreateConfessionRequestPayload(req.body);
    const filterdPayload = pickAllowedFields(createAndEditConfessionRequestAllowedAndRequiredFields, req.body)
    filterdPayload.user = req.user._id;
    const confessionRequest = await ConfessionRequest.create(filterdPayload);
    res.json({
      status: "success",
      message: "Confession request created successfully",
      data: confessionRequest
    });
  } catch(err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to create confession request, "+err.message
    });
  }
}

export const updateConfessionRequest = async (req, res) => {
  try {
    const confessionRequestId = req.params.confession_request_id;
    if(!confessionRequestId) {
      throw new Error("Confession request id required");
    }
    if(!mongoose.Types.ObjectId.isValid(confessionRequestId)) {
      throw new Error("Invalid id");
    }
    const confessionRequest = await ConfessionRequest.findById(confessionRequestId);
    if(!confessionRequest) {
      throw new Error("Confession request not found");
    }
    validateUpdateConfessionRequestPayload(req.body);
    const filteredPayload = pickAllowedFields(createAndEditConfessionRequestAllowedAndRequiredFields, req.body);
    const updatedConfessionRequest = await ConfessionRequest.findByIdAndUpdate(confessionRequestId, filteredPayload, {new: true});
    res.json({
      status: "success",
      message: "Confession request updated successfully",
      data: updatedConfessionRequest
    });

  } catch(err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to update confession request, "+err.message
    });
  }
}


export const getOneConfessionRequest = async (req, res) => {
  try {
    const confessionRequestId = req.params.confession_request_id;
    if(!confessionRequestId) {
      throw new Error("Confession request id required");
    }
    const confessionRequest = validateIdAndGiveThatDocument(confessionRequestId, ConfessionRequest); // change this function's name da because it fetches that document also - done
    res.json({
      status: "success",
      message: "Confession request fetched successfully",
      data: confessionRequest
    });
  } catch(err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to fetch confession request "+err.message
    });
  }
}
 
export const getAllConfesstionRequests = async (req, res) => {
  try {
    const allConfessionRequests = await ConfessionRequest.find({user: req.user._id});
    res.json(successResponse("All confession requests fetched successfully", allConfessionRequests));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to fetch all confession requests, "+err.message));
  }
} 

export const cancelConfessionRequest = async (req, res) => {
  try {
    const confessionRequestId = req.params.confession_request_id;
    if(!confessionRequestId) {
      throw new Error("Confession request id required");
    }
    const confessionRequest = await validateIdAndGiveThatDocument(confessionRequestId, ConfessionRequest);
    const cancelledConfessionRequest = await ConfessionRequest.findByIdAndUpdate(confessionRequestId, {status: "cancelled"});
    res.json(successResponse("Confession request cancelled successfully", cancelledConfessionRequest));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to cancel confession request, "+err.message));
  }
}


