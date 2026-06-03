import { baptismRequestCreateAllowedFields, updateBaptismRequestAllowedFields } from "../constants/baptismRequestConstants.js";
import BaptismRequest from "../models/BaptismRequest.js";
import { pickAllowedFields } from "../utils/generalHelpers.js";
import { validateCreateBaptismRequestPayload } from "../utils/baptismRequestUtils.js";
import mongoose from "mongoose";
import { validateUpdateBaptismRequestPayload } from "../utils/baptismRequestUtils.js";

export const createBaptismRequest = async (req, res) => {
  try {
    await validateCreateBaptismRequestPayload(req.body);
    const AlreadyActiveBaptismRequestsOfThisSameChild = await BaptismRequest.findOne({child_name: req.body.child_name, child_date_of_birth: req.body.child_date_of_birth, status: {$in: ["pending", "approved"]}});
    if(AlreadyActiveBaptismRequestsOfThisSameChild) {
      throw new Error("Baptism request is already exist for this child ");
    }
    const filteredBaptismRequestObject = pickAllowedFields(baptismRequestCreateAllowedFields, req.body);
    filteredBaptismRequestObject.user = req.user._id;
    const newBaptismRequest = await BaptismRequest.create(filteredBaptismRequestObject);
    res.json({
      status: "success",
      message: "Baptism request created successfully",
      data: newBaptismRequest
    });

  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to create baptism request: "+err.message
    });
  }
}

export const updateBaptismRequest = async (req, res) => {
  try {
    const baptismRequestId = req.params.baptism_request_id;
    if(!mongoose.Types.ObjectId.isValid(baptismRequestId)) {
      throw new Error("Invalid baptism request id");
    }
    const bapstismRequest = await BaptismRequest.findById(baptismRequestId);
    if(!bapstismRequest) {
      return res.status(404).json({
        status: "failure",
        message: "Baptism request not found"
      });
    }
    if(!bapstismRequest.user.equals(req.user._id)) {
      return res.status(403).json({
        status:"failure",
        message: "You can update only your requests"
      });
    }
    if(bapstismRequest.status !== "pending") {
      throw new Error("Only requests with pending status can be updated but now this request has status as "+bapstismRequest.status);
    }
    validateUpdateBaptismRequestPayload(req.body);
    const filteredNewBaptismRequestObject = pickAllowedFields(updateBaptismRequestAllowedFields, req.body);
    const updatedBaptismRequest = await BaptismRequest.findOneAndUpdate({_id: baptismRequestId}, filteredNewBaptismRequestObject, {new: true, runValidators: true});
    res.json({
      status: "success",
      message: "Baptism Request updated successfully",
      data: updatedBaptismRequest
    });

  } catch(err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to update baptism request: "+err.message
    });
  }
}

export const getOneBaptismRequest = async (req, res) => {
  try {
    const baptismRequestId = req.params.baptism_request_id;
    if(!mongoose.Types.ObjectId.isValid(baptismRequestId)) throw new Error("Invalid id");
    const baptismRequest = await BaptismRequest.findById(baptismRequestId);
    if(!baptismRequest) {
      return res.status(404).json({
        status: "failure",
        message: "Baptism request not found"
      });
    }
    res.json({
      status: "success",
      message: "Baptism request fetched successfully",
      data: baptismRequest
    });


  } catch(err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to get baptism request: "+err.message
    });
  }
}

export const getAllBaptismRquests = async (req, res) => {
  try {
    const allBaptismRequestsOfLoggedInUser = await BaptismRequest.find({user: req.user._id});
    res.json({
      status: "success",
      message: "All baptism requests of logged in user fetched successfully",
      data: allBaptismRequestsOfLoggedInUser
    });

  } catch(err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to fetch all baptism requests of logged in user: "+err.message
    })
  }
}

export const cancelBaptismRequest = async (req, res) => {
  try {
    const baptismRequestId = req.params.baptism_request_id;
    if(!mongoose.Types.ObjectId.isValid(baptismRequestId)) {
      throw new Error("Invalid id");
    }
    const baptismRequest = await BaptismRequest.findById(baptismRequestId);
    if(!baptismRequest) {
      return res.status(404).json({
        status: "failure",
        message: "Baptism Request not found"
      });
    }
    if(baptismRequest.status !== "pending") {
      throw new Error("Only pending status of baptism request can be cancelled but current one is of status: "+baptismRequest.status);
    }
    const cancelledBaptismRequest = await BaptismRequest.findOneAndUpdate({_id: baptismRequestId}, { status: "cancelled" }, {new: true, runValidators: true});
    res.json({
      status: "success",
      message: "Baptism request cancelled successfully",
      data: cancelledBaptismRequest
    });
  } catch(err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to cancel baptism request: "+ err.message
    });
  }
}

