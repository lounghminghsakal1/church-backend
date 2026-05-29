import mongoose from "mongoose";
import { checkIsthereInvalidFields, checkAllRequiredFieldsPresent } from "./generalHelpers.js";
import validator from "validator";
import { editPriestAllowedFields, createPriestAllowedFields, createPriestRequiredFields } from "../constants/priestConstants.js";

export const validateCreatePriestData = (createPriestPayload) => {
    const createPriestAvailabilityRequiredFields = ["priest", "availability_status", createPriestAvailabilityRequestBody.availability_status === "available" && "available_until", createPriestAvailabilityRequestBody.availability_status === "not_available" && "next_available"].filter(Boolean);
    checkIsthereInvalidFields(createPriestAvailabilityRequiredFields, createPriestPayload);
    
    checkAllRequiredFieldsPresent(createPriestRequiredFields, createPriestPayload);
    
    const { priest_email } = createPriestPayload;
    if(!validator.isEmail(priest_email)) {
      throw new Error("Invalid email");
    }

    return true;
}

export const validateUpdatePriestPayload = (req) => {
  
  checkIsthereInvalidFields(editPriestAllowedFields, req.body);

  const priestId = req.params.priest_id;
  if(!mongoose.Types.ObjectId.isValid(priestId)) throw new Error("Invalid priest id");

  if(!req.priest._id.equals(priestId)) {
    throw new Error("You can't update another's data");
  }

  return true;

}
