import { editPriestAllowedFields } from "../constants/priestConstants.js";
import Priest from "../models/Priest.js";
import { pickAllowedFields } from "../utils/generalHelpers.js";
import { validateCreatePriestData, validateUpdatePriestPayload } from "../utils/priestUtils.js";
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

