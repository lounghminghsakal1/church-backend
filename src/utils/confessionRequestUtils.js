import { createAndEditConfessionRequestAllowedAndRequiredFields } from "../constants/confessionRequestConstants.js"
import { checkAllRequiredFieldsPresent, checkIsthereInvalidFields } from "./generalHelpers.js";

export const validateCreateConfessionRequestPayload = (createConfessionRequestPayload) => {
  checkIsthereInvalidFields(createAndEditConfessionRequestAllowedAndRequiredFields, createConfessionRequestPayload);
  checkAllRequiredFieldsPresent(createAndEditConfessionRequestAllowedAndRequiredFields, createConfessionRequestPayload);
  return true; 
}

export const validateUpdateConfessionRequestPayload = (updateConfessionRequestPayload) => {
  checkIsthereInvalidFields(createAndEditConfessionRequestAllowedAndRequiredFields, updateConfessionRequestPayload);
  return true;
}