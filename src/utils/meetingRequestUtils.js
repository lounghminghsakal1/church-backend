import { createAndUpdateMeetingRequestAllowedAndRequiredFields } from "../constants/meetingRequestConstants.js"
import { checkAllRequiredFieldsPresent, checkIsthereInvalidFields } from "./generalHelpers.js"

export const validateCreateMeetingRequestPayload = (createMeetingRequestPayload) => {
  checkIsthereInvalidFields(createAndUpdateMeetingRequestAllowedAndRequiredFields, createMeetingRequestPayload);
  checkAllRequiredFieldsPresent(createAndUpdateMeetingRequestAllowedAndRequiredFields, createMeetingRequestPayload);
  return true;
}

export const validateUpdateMeetingRequestPayload = (updateMeetingRequestPayload) => {
  checkIsthereInvalidFields(createAndUpdateMeetingRequestAllowedAndRequiredFields, updateMeetingRequestPayload);
  return true;
}