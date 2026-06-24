import { checkIsthereInvalidFields } from "./generalHelpers.js";
import { updateUserAllowedFields } from "../constants/userConstants.js";

export const validateUpdateUserPayload = (updateUserPayload) => {
  
  // const invalidFields = Object.keys(updateUserPayload).filter(field => !updateUserAllowedFields.includes(field))
  checkIsthereInvalidFields(updateUserAllowedFields, updateUserPayload);
  return true;
}