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

    if(createPriestPayload.priest_password.length < 8) {
      throw new Error("Password length must be atleast 8 characters including numbers and special characters");
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

export const validateReviewBaptismRequestPayload = (reviewBaptismRequestPayload) => {
  const reviewBaptismRequestAllowedFields = ["status", "priest_response"];
  checkIsthereInvalidFields(reviewBaptismRequestAllowedFields, reviewBaptismRequestPayload);

  checkAllRequiredFieldsPresent(["status"], reviewBaptismRequestPayload);

  return true;
}

export const validateReviewEucharistRequestPayload = (reviewEucharistRequestPayload) => {
  const reviewEucharistRequestAllowedFields = ["status", "priest_response"];
  checkIsthereInvalidFields(reviewEucharistRequestAllowedFields, reviewEucharistRequestPayload);

  checkAllRequiredFieldsPresent(["status"], reviewEucharistRequestPayload);
  return true;
}

export const validateReviewConfessionRequest = (reviewConfessionRequestPayload) => {
  const reviewConfessionRequestAllowedFields = ["status", "priest_response"];
  checkIsthereInvalidFields(reviewConfessionRequestAllowedFields, reviewConfessionRequestPayload);

  checkAllRequiredFieldsPresent(["status"], reviewConfessionRequestPayload);
  return true;
}

