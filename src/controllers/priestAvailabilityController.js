import { editPriestAvailabilityAllowedFields } from "../constants/priestAvailabilityConstants.js";
import Priest from "../models/Priest.js";
import PriestAvailability from "../models/PriestAvailability.js"
import { pickAllowedFields } from "../utils/generalHelpers.js";
import { validateCreatePriestAvailabilityData, validateEditPriestAvailabilityPayload } from "../utils/priestAvailabilityUtils.js";
import { prepareAvailabilityUpdate } from "../utils/availabilityReminderUtils.js";

export const getAllPriestAvailability = async (req, res) => {
  try {
    const priestAvailabilityData = await PriestAvailability.find();
    res.json({
      status: "success",
      message: "Priest availability data fetched successfully",
      data: priestAvailabilityData
    });
  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: `Failed to fetch all priest availablilty data: ${err.message}`
    })
  }
}

export const getPriestAvailabilityById = async (req, res) => {
  try {
    const priestId = req.params.priest_id;
    const isPriestExists = await Priest.findById(priestId);
    if (!isPriestExists) {
      res.status(404).json({
        status: "failure",
        message: `Priest not found with priest id ${priestId}`
      })
    }
    const priestAvailabilityData = await PriestAvailability.findOne({ priest: priestId }).populate("priest", ["priest_name", "priest_type"]);
    res.json({
      status: "success",
      message: "Priest availability data fetched successfully",
      data: priestAvailabilityData
    });

  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: `Failed to fetch priest availability data: ${err.message}`
    });
  }
}

export const createPriestavailability = async (req, res) => {
  try {
    await validateCreatePriestAvailabilityData(req.body);
    if (String(req.body.priest) !== String(req.priest._id)) {
      return res.status(403).json({
        status: "failure",
        message: "You can't create availability for another one"
      });
    }

    const savedNewPriestAvailabilityData = await PriestAvailability.create({
      ...req.body, ...prepareAvailabilityUpdate({}, req.body)
    });

    res.status(201).json({
      status: "success",
      message: "Priest availability data created successfully",
      data: savedNewPriestAvailabilityData
    });

  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: `Failed to create priest avaialability data: ${err.message}`,
    });
  }
}

export const editPriestAvailability = async (req, res) => {
  try {
    const existing = await validateEditPriestAvailabilityPayload(req);
    if (String(existing.priest) !== String(req.priest._id)) {
      return res.status(403).json({ status: "failure", message: "You can only edit your own availability" });
    }
    
    const filteredUpdates = pickAllowedFields(editPriestAvailabilityAllowedFields, req.body);

    const updates = prepareAvailabilityUpdate(existing.toObject(), filteredUpdates);
    const updatedPriestAvailability = await PriestAvailability.findOneAndUpdate({
      _id: existing._id, priest: req.priest._id, __v: existing.__v
    }, { $set: updates, $inc: { __v: 1 } }, { new: true, runValidators: true });
    if (!updatedPriestAvailability) {
      return res.status(409).json({ status: "failure", message: "Availability changed; reload and try again" });
    }
    res.json({
      status: "success",
      message: "Priest availability data updated successfully",
      data: updatedPriestAvailability
    });
  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to update priest availability data: " + err.message
    });
  }
}
