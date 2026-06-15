import { createAndEditConfessionRequestAllowedAndRequiredFields } from "../constants/confessionRequestConstants.js";
import { createAndUpdateMeetingRequestAllowedAndRequiredFields } from "../constants/meetingRequestConstants.js";
import MeetingRequest from "../models/MeetingRequest.js";
import { failureResponse, pickAllowedFields, successResponse, validateIdAndGiveThatDocument } from "../utils/generalHelpers.js";
import { validateCreateMeetingRequestPayload, validateUpdateMeetingRequestPayload } from "../utils/meetingRequestUtils.js";

export const createMeetingRequest = async (req, res) => {
  try {
    validateCreateMeetingRequestPayload(req.body);
    const filteredPayload = pickAllowedFields(createAndUpdateMeetingRequestAllowedAndRequiredFields, req.body);
    filteredPayload.user = req.user._id;
    const meetingRequest = await MeetingRequest.create(filteredPayload);
    res.json(successResponse("Meeting request created successfully", meetingRequest));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to create meeting request, "+err.message));
  }
}


export const updateMeetingRequest = async (req, res) => {
  try {
    const meetingRequestId = req.params.meeting_request_id;
    if(!meetingRequestId) throw new Error("Meeting request id needed");
    const meetingRequest = await validateIdAndGiveThatDocument(meetingRequestId, MeetingRequest);
    if(meetingRequest.status !== "pending") throw new Error("Only meeting requests with pending status can be updated");
    validateUpdateMeetingRequestPayload(req.body);
    let filteredPayload = pickAllowedFields(createAndUpdateMeetingRequestAllowedAndRequiredFields, req.body);
    const updatedMeetingRequest = await MeetingRequest.findByIdAndUpdate(meetingRequestId, filteredPayload, {new: true});
    res.json(successResponse("Meeting request updated successfully", updateMeetingRequest));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to update meeting request "+err.message));
  }
}

export const getOneMeetingRequest = async (req, res) => {
  try {
    const meetingRequestId = req.params.meeting_request_id;
    if(!meetingRequestId) throw new Error("Meeting request id is required");
    const meetingRequest = await validateIdAndGiveThatDocument(meetingRequestId, MeetingRequest);
    res.json(successResponse("Meeting request fetched successfully", meetingRequest));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to fetch meeting request, "+err.message));
  }
}

export const getAllMeetingrequests = async (req, res) => {
  try {
    const allMeetingRequests = await MeetingRequest.find({user: req.user._id});
    res.json(successResponse("All meeting requests fetched successfully", allMeetingRequests));
  } catch(err) {
    res.json(failureResponse("Failed to fetch all meeting requests, "+err.message));
  }
}


export const cancelMeetingRequest = async (req, res) => {
  try {
    const meetingRequestId = req.params.meeting_request_id;
    if(!meetingRequestId) throw new Error("Meeting request id is required");
    const meetingRequest = await validateIdAndGiveThatDocument(meetingRequestId, MeetingRequest);
    if(meetingRequest.status !== "pending") throw new Error("Only meeting request with pending status can be cancelled");
    const cancelledMeetingRequest = await MeetingRequest.findByIdAndUpdate(meetingRequestId, {status: "cancelled"}, {new: true});
    res.json(successResponse("Meeting request cancelled successfully", cancelledMeetingRequest));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to cancel meeting request, "+err.message));
  }
}





