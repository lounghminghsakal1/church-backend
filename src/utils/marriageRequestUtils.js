import { checkAllRequiredFieldsPresent, checkIsthereInvalidFields } from "./generalHelpers.js";
import { createAndEditMarriageRequestAllowedAndRequiredFields } from "../constants/marriageRequestConstants.js";

export const validateCreateMarriagerequestPayload = (createMarriageRequestPayload) => {
  checkIsthereInvalidFields(createAndEditMarriageRequestAllowedAndRequiredFields, createMarriageRequestPayload);

  checkAllRequiredFieldsPresent(createAndEditMarriageRequestAllowedAndRequiredFields, createMarriageRequestPayload);
  return true;
}

export const validateEditMarriageRequestPayload = (editMarriageRequestPayload) => {
  checkIsthereInvalidFields(createAndEditMarriageRequestAllowedAndRequiredFields, editMarriageRequestPayload);
  return true;
}


