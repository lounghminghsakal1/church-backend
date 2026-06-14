import { createEucharistRequiredAndAllowedFields } from "../constants/eucharistRequestConstants.js"
import { checkAllRequiredFieldsPresent, checkIsthereInvalidFields } from "./generalHelpers.js"

export const validateCreateEucharistBody = (createEucharistRequestPayload) => {
  checkIsthereInvalidFields(createEucharistRequiredAndAllowedFields, createEucharistRequestPayload);
  checkAllRequiredFieldsPresent(createEucharistRequiredAndAllowedFields, createEucharistRequestPayload);
  return true; 
}

export const validateUpdateEucharistPayload = (updateEucharistRequestPayload) => {
  checkIsthereInvalidFields(createEucharistRequiredAndAllowedFields, updateEucharistRequestPayload);
  checkAllRequiredFieldsPresent(createEucharistRequiredAndAllowedFields, updateEucharistRequestPayload);
  return true;
}

