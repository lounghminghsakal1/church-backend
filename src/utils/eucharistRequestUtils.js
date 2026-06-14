import { createAndEditEucharistRequiredAndAllowedFields } from "../constants/eucharistRequestConstants.js"
import { checkAllRequiredFieldsPresent, checkIsthereInvalidFields } from "./generalHelpers.js"

export const validateCreateEucharistBody = (createEucharistRequestPayload) => {
  checkIsthereInvalidFields(createAndEditEucharistRequiredAndAllowedFields, createEucharistRequestPayload);
  checkAllRequiredFieldsPresent(createAndEditEucharistRequiredAndAllowedFields, createEucharistRequestPayload);
  return true; 
}

export const validateUpdateEucharistPayload = (updateEucharistRequestPayload) => {
  checkIsthereInvalidFields(createAndEditEucharistRequiredAndAllowedFields, updateEucharistRequestPayload);
  return true;
}

