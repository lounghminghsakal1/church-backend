import mongoose from "mongoose";
import { createAndEditEucharistRequiredAndAllowedFields } from "../constants/eucharistRequestConstants.js";
import EucharistRequest from "../models/EucharistRequest.js";
import User from "../models/User.js";
import { pickAllowedFields } from "../utils/generalHelpers.js";
import { validateCreateEucharistBody, validateUpdateEucharistPayload } from "../utils/eucharistRequestUtils.js";

export const createEucharistRequest = async (req, res,) => {
  try {
    validateCreateEucharistBody(req.body);
    const filteredPayload = pickAllowedFields(createAndEditEucharistRequiredAndAllowedFields, req.body);
    filteredPayload.user = req.user._id;
    const eucharistRequest = await EucharistRequest.create(filteredPayload);
    res.status(201).json({
      status: "success",
      message: "Eucharist request made successfully",
      data: eucharistRequest
    });

  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to create eucharist request, " + err.message
    });
  }
}

export const updateEucharistRequest = async (req, res) => {
  try {
    const eucharistRequestId = req.params.eucharist_request_id;
    if (!mongoose.Types.ObjectId.isValid(eucharistRequestId)) {
      return res.status(422).json({
        status: "failure",
        message: "Invalid id"
      });
    }
    const oldEucharist = await EucharistRequest.findById(eucharistRequestId);
    if (!oldEucharist) {
      return res.status(404).json({
        status: "failure",
        message: "Eucharist data not found"
      });
    }
    if (!oldEucharist.user._id.equals(req.user._id)) {
      res.status(422).json({
        status: "failure",
        message: "You can update only your requests, not others"
      });
    }
    if (oldEucharist.status !== "pending") {
      return res.status(400).json({
        status: "failure",
        message: "Only requests with pending status can be edited"
      });
    }
    validateUpdateEucharistPayload(req.body);
    const filteredPayload = pickAllowedFields(createAndEditEucharistRequiredAndAllowedFields, req.body);
    const updatedEucharistRequest = await EucharistRequest.findByIdAndUpdate(eucharistRequestId, filteredPayload, { new: true });

    res.json({
      status: "success",
      message: "Eucharist request updated successfully",
      data: updateEucharistRequest
    });

  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to update Eucharist request, " + err.message
    });
  }
}

export const getOneEucharistRequest = async (req, res) => {
  try {
    const eucharistRequestId = req.params.eucharist_request_id;
    if (!eucharistRequestId) {
      return res.status(404).json({
        status: "failure",
        message: "Eucharist id needed"
      });
    }
    if (!mongoose.Types.ObjectId.isValid(eucharistRequestId)) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid id"
      });
    }
    const eucharistRequest = await EucharistRequest.findById(eucharistRequestId);
    res.json({
      status: "success",
      message: "Eucharist request data fetched successfully",
      data: eucharistRequest
    });

  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: "Falied to fetchh eucharist request, " + err.message
    });
  }
}

export const getAllEucharistRequests = async (req, res) => {
  try {
    const allEucharistRequests = await EucharistRequest.find({ user: req.user._id });
    res.json({
      status: "success",
      message: "All Eucharist requests are fetched successfully",
      data: allEucharistRequests
    });

  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to fetch all Eucharist requests, " + err.message
    });
  }
}

export const cancelEucharistRequest = async (req, res) => {
  try {
    const eucharistRequestId = req.params.eucharist_request_id;
    if (!mongoose.Types.ObjectId.isValid(eucharistRequestId)) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid id"
      });
    }
    const eucharistRequest = await EucharistRequest.findById(eucharistRequestId);
    if(!eucharistRequest) {
      return res.status(404).json({
        status: "failure",
        message: "Eucharist request not found"
      });
    }
    if(eucharistRequest.status !== "pending") {
      throw new Error("Only requests with pending status can be cancelled");
    }
    const cancelledEucharistRequest = await EucharistRequest.findByIdAndUpdate(eucharistRequestId, {status: "cancelled"}, {new:true});
    res.json({
      status: "sucess",
      message: "Eucharist Request cancelled successfully",
      data: cancelledEucharistRequest
    });

  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to cancel eucharist request, "+err.message
    });
  }
}
