import { createAndEditConfirmationRequestAllowedAndRequiredFields } from "../constants/confirmationRequestConstants.js";
import ConfirmationRequest from "../models/ConfirmationRequest.js";
import { validateCreateConfirmationRequestPayload, validateUpdateConfirmationRequestPayload } from "../utils/confirmationRequestsUtils.js";
import { failureResponse, pickAllowedFields, successResponse, validateIdAndGiveThatDocument } from "../utils/generalHelpers.js";

export const createConfirmationRequest = async (req, res) => {
  try {
    validateCreateConfirmationRequestPayload(req.body);
    const filteredPayload = pickAllowedFields(createAndEditConfirmationRequestAllowedAndRequiredFields, req.body);
    filteredPayload.user = req.user._id;
    const confirmationRequest = await ConfirmationRequest.create(filteredPayload);
    res.json(successResponse("Confirmation request created successfully", confirmationRequest));
  } catch (err) {
    res.status(400).json(failureResponse("Failed to create confirmation request, " + err.message));
  }
}

export const updateConfirmationRequest = async (req, res) => {
  try {
    const confirmationRequestId = req.params.confirmation_request_id;
    if (!confirmationRequestId) throw new Error("Confirmation request id is required");
    const confirmationRequest = await validateIdAndGiveThatDocument(confirmationRequestId, ConfirmationRequest);
    if (confirmationRequest.status !== "pending") throw new Error("Only cofirmation request with status pending can be edited");
    validateUpdateConfirmationRequestPayload(req.body);
    const filteredPayload = pickAllowedFields(createAndEditConfirmationRequestAllowedAndRequiredFields, req.body);
    const updatedConfirmationRequest = await ConfirmationRequest.findByIdAndUpdate(confirmationRequestId, filteredPayload, { new: true });
    res.json(successResponse("Confirmation request updated successfully", updateConfirmationRequest));
  } catch (err) {
    res.status(400).json(failureResponse("Failed to updated confirmation request, " + err.message));
  }
}

export const getOneConfirmationRequest = async (req, res) => {
  try {
    const confirmationRequestId = req.params.confirmation_request_id;
    if (!confirmationRequestId) throw new Error("Confirmation request id is required");
    const confirmationRequest = await validateIdAndGiveThatDocument(confirmationRequestId, ConfirmationRequest);
    res.json(successResponse("Confirmation request fetched successfully", confirmationRequest));
  } catch (err) {
    res.status(400).json(failureResponse("Failed to fetch confirmation request, " + err.message));
  }
}


export const getAllConfirmationRequests = async (req, res) => {
  try {
    const allConfirmationRequests = await ConfirmationRequest.find({ user: req.user._id });
    res.json(successResponse("All confirmation requests are fetched successfully", allConfirmationRequests));
  } catch (err) {
    res.status(400).json(failureResponse("Failed to fetch confirmation requests, " + err.message));
  }
}

export const cancelConfirmationRequest = async (req, res) => {
  try {
    const confirmationRequestId = req.params.confirmation_request_id;
    if (!confirmationRequestId) throw new Error("Confirmation request id is required");
    const confirmationRequest = await validateIdAndGiveThatDocument(confirmationRequestId, ConfirmationRequest);
    if (confirmationRequest.status !== "pending") throw new Error("Only cofirmation request with status pending can be cancelled");
    const cancelledConfirmationRequest = await ConfirmationRequest.findByIdAndUpdate(confirmationRequest, {status: "cancelled"}, {new: true});
    res.json(successResponse("Confirmation request cancelled successfullly", cancelledConfirmationRequest));
  } catch (err) {
    res.status(400).json(failureResponse("Failed to cancel confirmation request, "+err.message));
  }
}






