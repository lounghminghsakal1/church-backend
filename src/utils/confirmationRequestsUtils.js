import { checkAllRequiredFieldsPresent, checkIsthereInvalidFields } from "./generalHelpers.js"
import { createAndEditConfirmationRequestAllowedAndRequiredFields } from "../constants/confirmationRequestConstants.js";

export const validateCreateConfirmationRequestPayload = (createConfirmationRequestPayload) => {
  checkIsthereInvalidFields(createAndEditConfirmationRequestAllowedAndRequiredFields, createConfirmationRequestPayload);

  checkAllRequiredFieldsPresent(createAndEditConfirmationRequestAllowedAndRequiredFields, createConfirmationRequestPayload);
  return true;
}


export const validateUpdateConfirmationRequestPayload = (updateConfirmationRequestPayload) => {
  checkIsthereInvalidFields(createAndEditConfirmationRequestAllowedAndRequiredFields, updateConfirmationRequestPayload);
  return true;
}