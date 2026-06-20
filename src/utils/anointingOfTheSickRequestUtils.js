import { checkAllRequiredFieldsPresent, checkIsthereInvalidFields } from "./generalHelpers.js";
import { createAndEditAOSRequestAllowedFields, createAOSRequestRequiredFields } from "../constants/anointingOfTheSickRequestConstants.js";


export const validateCreateAOSRequestPayload = (createAOSRequestPayload) => {

  checkIsthereInvalidFields(createAndEditAOSRequestAllowedFields, createAOSRequestPayload);

  checkAllRequiredFieldsPresent(createAOSRequestRequiredFields, createAOSRequestPayload);
  return true;
}

export const validateAOSRequestEditPayload = (editAOSRequestPayload) => {
  checkIsthereInvalidFields(createAndEditAOSRequestAllowedFields, editAOSRequestPayload);
  return true;
}