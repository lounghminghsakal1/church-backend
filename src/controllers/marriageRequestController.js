import { createAndEditMarriageRequestAllowedAndRequiredFields } from "../constants/marriageRequestConstants.js";
import MarriageRequest from "../models/MarriageRequest.js";
import { failureResponse, pickAllowedFields, successResponse, validateIdAndGiveThatDocument } from "../utils/generalHelpers.js";
import { validateCreateMarriagerequestPayload, validateEditMarriageRequestPayload } from "../utils/marriageRequestUtils.js";

export const createMarriageRequest = async (req, res) => {
  try {
    validateCreateMarriagerequestPayload(req.body);
    const filteredPayload = pickAllowedFields(createAndEditMarriageRequestAllowedAndRequiredFields, req.body);
    filteredPayload.user = req.user._id;
    const newMarriageRequest = await MarriageRequest.create(filteredPayload);
    res.json(successResponse("Marriage request created successfully", newMarriageRequest));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to create marriage request, "+err.message));
  }
}

export const editMarriageRequest = async (req, res) => {
  try {
    const marriageRequestId = req.params.marriage_request_id;
    if(!marriageRequestId) throw new Error("Marriage request id required");
    const oldMarriageRequest = await validateIdAndGiveThatDocument(marriageRequestId, MarriageRequest); 
    //try to integrate this next line check within this validateIdAndGiveThatDocument function itself 
    if(req.user._id.toString() !== oldMarriageRequest.user.toString()) throw new Error("You can't edit other's data");
    if(oldMarriageRequest.status !== "pending") throw new Error("Only marriage request with pending status can be edited");
    validateEditMarriageRequestPayload(req.body);
    const filteredPayload = pickAllowedFields(createAndEditMarriageRequestAllowedAndRequiredFields, req.body);
    const updatedMarriageRequest = await MarriageRequest.findByIdAndUpdate(marriageRequestId, filteredPayload, {new: true});
    res.json(successResponse("Marriage request updated successfully", updatedMarriageRequest));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to update marriage request, "+err.message));
  }
}

export const getOneMarriageRequest = async (req, res) => {
  try {
    const marriageRequestId = req.params.marriage_request_id;
    if(!marriageRequestId) throw new Error("Marriage request id is required");
    const marriageRequest = await validateIdAndGiveThatDocument(marriageRequestId, MarriageRequest);
    res.json(successResponse("Marriage request fetched successfully", marriageRequest));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to fetch marriage request, "+ err.message));
  }
}

export const getAllMarriageRequest = async (req, res) => {
  try {
    const allMarriageRequests = await MarriageRequest.find({user: req.user._id});
    res.json(successResponse("All marriage requests fetched successfully", allMarriageRequests));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to fetch all marriage requests, "+err.message));
  }
}

export const cancelMarriageRequest = async (req, res) => {
  try {
    const marriageRequestId = req.params.marriage_request_id;
    if(!marriageRequestId) throw new Error("Marriage request id is required");
    const marriageRequest = await validateIdAndGiveThatDocument(marriageRequestId, MarriageRequest);
    if(marriageRequest.status !== "pending") throw new Error("Only marriage request with pending status can be cancelled");
    const cancelledMarriageRequest = await MarriageRequest.findByIdAndUpdate(marriageRequestId, {status: "cancelled"}, {new:true});
    res.json(successResponse("Marriage request cancelled successfully", cancelledMarriageRequest));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to cancel marriage request, "+err.message));
  }
}

