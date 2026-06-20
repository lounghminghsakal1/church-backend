import { createAndEditAOSRequestAllowedFields } from "../constants/anointingOfTheSickRequestConstants.js";
import AnointingOfTheSickRequest from "../models/AnointingOfTheSickRequest.js";
import { failureResponse, pickAllowedFields, successResponse, validateIdAndGiveThatDocument } from "../utils/generalHelpers.js";
import { validateCreateAOSRequestPayload, validateAOSRequestEditPayload } from "../utils/anointingOfTheSickRequestUtils.js";

export const createAnointingOfTheSickRequest = async (req, res) => {
  try {
    validateCreateAOSRequestPayload(req.body); //AOS - Anointing of the request
    if (req.body.is_urgent === false && !req.body.preferred_visit_date_and_time) throw new Error("Preferred visit date and time is required when its not urgent situation");
    let filteredPayload = pickAllowedFields(createAndEditAOSRequestAllowedFields, req.body);
    filteredPayload.user = req.user._id;
    const AOSRequest = await AnointingOfTheSickRequest.create(filteredPayload);
    res.status(201).json(successResponse("Anointing of the sick request created successfully", AOSRequest));
  } catch (err) {
    res.status(400).json(failureResponse("Failed to create Anointing of the sick request, " + err.message));
  }
}

export const editAnointingOfTheSickRequest = async (req, res) => {
  try {
    const AOSRequestId = req.params.aos_request_id;
    if (!AOSRequestId) throw new Error("Anointing of the sick request id is required");
    const AOSRequest = await validateIdAndGiveThatDocument(AOSRequestId, AnointingOfTheSickRequest);
    if (AOSRequest.status !== "pending") throw new Error("Only status as pending can be edited");
    validateAOSRequestEditPayload(req.body);
    if (req.body.is_urgent === false && !req.body.preferred_visit_date_and_time) throw new Error("Preferred visit date and time is required when its not urgent situation");
    const filteredPayload = pickAllowedFields(createAndEditAOSRequestAllowedFields, req.body);
    const updatedAOSRequest = await AnointingOfTheSickRequest.findByIdAndUpdate(AOSRequestId, filteredPayload, { new: true });
    res.json(successResponse("Anointing of the sick request updated successfully", updatedAOSRequest));
  } catch (err) {
    res.status(400).json(failureResponse("Failed to update anointing of the sick request, "+err.message));
  }
}

export const getOneAnointingOfTheSickRequest = async (req, res) => {
  try {
    const AOSRequestId = req.params.aos_request_id;
    if (!AOSRequestId) throw new Error("Anointing of the sick request id is required");
    const AOSRequest = await validateIdAndGiveThatDocument(AOSRequestId, AnointingOfTheSickRequest);
    res.json(successResponse("Anointing of the sick request fetched successfully", AOSRequest));
  } catch (err) {
    res.status(400).json(failureResponse("Failed to fetch anointing of the sick request"));
  }
}

export const getAllAnointingOfTheSickRequest = async (req, res) => {
  try {
    const allAOSRequests = await AnointingOfTheSickRequest.find({ user: req.user._id });
    res.json(successResponse("All Anointing of the sick requests are fetched successfuly", allAOSRequests));
  } catch (err) {
    res.status(400).json(failureResponse("Failed to fetch all anointing of the sick requests"));
  }
}

export const cancelAnointingOfTheSickRequest = async (req, res) => {
  try {
    const AOSRequestId = req.params.aos_request_id;
    if (!AOSRequestId) throw new Error("Anointing of the sick request id is required");
    const AOSRequest = await validateIdAndGiveThatDocument(AOSRequestId, AnointingOfTheSickRequest);
    if (AOSRequest.status !== "pending") throw new Error("Only status as pending can be cancelled");
    const cancelledAOSRequest = await AnointingOfTheSickRequest.findByIdAndUpdate(AOSRequestId, {status: "cancelled"}, {new:true});
    res.json(successResponse("Anointing of the sick request cancelled successfully"));
  } catch (err) {
    res.status(400).json(failureResponse("Failed to cancel anointing of the sick request"));
  }
}
