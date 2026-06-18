import { checkAllRequiredFieldsPresent, checkIsthereInvalidFields } from "./generalHelpers.js";

export const validateCreateMassPrayerPayload = (createMassPrayerPayload) => {
  const createMassPrayerAllowedAndRequiredFields = ["mass_prayer_date_and_time", "payment_mode"];
  checkIsthereInvalidFields(createMassPrayerAllowedAndRequiredFields, createMassPrayerPayload);

  checkAllRequiredFieldsPresent(createMassPrayerAllowedAndRequiredFields, createMassPrayerPayload);
  return true;
}

export const validateUpdateMassPrayerPayload = (updateMassPrayerPayload) => {
  const editMassPrayerAllowedFields = ["mass_prayer_date_and_time", "payment_mode"];
  checkIsthereInvalidFields(editMassPrayerAllowedFields, updateMassPrayerPayload);
  return true;
}