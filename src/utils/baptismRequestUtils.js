import { checkAllRequiredFieldsPresent, checkIsthereInvalidFields } from "./generalHelpers.js";
import { baptismRequestCreateAllowedFields, baptismRequestCreateRequiredFields, updateBaptismRequestAllowedFields } from "../constants/baptismRequestConstants.js";

export const validateCreateBaptismRequestPayload = (createBaptismRequestPayload) => {
  checkIsthereInvalidFields(baptismRequestCreateAllowedFields, createBaptismRequestPayload);
  checkAllRequiredFieldsPresent(baptismRequestCreateRequiredFields, createBaptismRequestPayload);
  return true;
}

export const validateUpdateBaptismRequestPayload = (updateBaptismRequestPayload) => {
  checkIsthereInvalidFields(updateBaptismRequestAllowedFields, updateBaptismRequestPayload);
  return true;
}