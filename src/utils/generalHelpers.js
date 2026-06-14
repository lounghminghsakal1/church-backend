import mongoose from "mongoose";

export const checkAllRequiredFieldsPresent = (requiredFields, payload) => {
  const missingFields = requiredFields.filter(field => payload[field] === undefined || payload[field] === null || payload[field] === "");
  if(missingFields.length > 0) {
    throw new Error(`Missing Fields: ${missingFields.join(", ")}`);
  } 
  return true;
}

export const checkIsthereInvalidFields = (allowedFields, payload) => {
  const fieldsPresent = Object.keys(payload);
  const invalidFields = fieldsPresent.filter(field => !allowedFields.includes(field));
  if(invalidFields.length > 0) {
    throw new Error(`Invalid fields: ${invalidFields.join(", ")}`);
  }
}

export const pickAllowedFields = (allowedFields, payload) => {
  let filtered = {};
  Object.keys(payload).forEach((key) => {
    if(allowedFields.includes(key)) {
      filtered[key] = payload[key];
    }
  })
  return filtered;
}

export const validateIdAndGiveThatDocument = async (id, model) => {
  if(!id || !model) return;
  if(!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid id");
  }
  const document = await model.findById(id);
  if(!document) {
    throw new Error("Request not found");
  }
  return document;
}

export const successResponse = (message, data) => {
  return {
    status: "success",
    message: message,
    data: data
  };
}

export const failureResponse = (message) => {
  return {
    status: "failure",
    message: message
  }
}