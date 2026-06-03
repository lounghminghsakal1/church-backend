import { editPriestAllowedFields } from "../constants/priestConstants.js";
import BaptismRequest from "../models/BaptismRequest.js";
import Priest from "../models/Priest.js";
import { pickAllowedFields } from "../utils/generalHelpers.js";
import { validateCreatePriestData, validateUpdatePriestPayload, validateReviewBaptismRequestPayload } from "../utils/priestUtils.js";
import bcrypt from "bcrypt";

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

export const getAllPendingBaptismRquests = async (req, res) => {
  try {
    const allPendingBaptismRequests = await BaptismRequest.find({ status: "pending" });
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
