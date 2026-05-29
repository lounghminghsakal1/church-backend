import mongoose from "mongoose";
import Priest from "../models/Priest.js";
import { checkAllRequiredFieldsPresent, checkIsthereInvalidFields } from "./generalHelpers.js";
import PriestAvailability from "../models/PriestAvailability.js";
import { editPriestAvailabilityAllowedFields, createPriestAvailabilityAllowedFields, } from "../constants/priestAvailabilityConstants.js";

export const validateCreatePriestAvailabilityData = async (createPriestAvailabilityRequestBody) => {
  
  checkIsthereInvalidFields(createPriestAvailabilityAllowedFields, createPriestAvailabilityRequestBody);
  
  const createPriestAvailabilityRequiredFields = ["priest", "availability_status", createPriestAvailabilityRequestBody.availability_status === "available" && "available_until", createPriestAvailabilityRequestBody.availability_status === "not_available" && "next_available"].filter(Boolean);
  checkAllRequiredFieldsPresent(createPriestAvailabilityRequiredFields, createPriestAvailabilityRequestBody);
  
  const { priest: priestId } = createPriestAvailabilityRequestBody;
  if(!mongoose.Types.ObjectId.isValid(priestId)) {
    throw new Error(`${priestId} is not valid id`);
  }
  const exists = await Priest.findOne({_id: priestId});
  if(!exists) throw new Error("Priest not found with id "+priestId);

  const isThereAlreadyPriestAvailabilityPresentForThisPriest = await PriestAvailability.findOne({priest: priestId});
  if(isThereAlreadyPriestAvailabilityPresentForThisPriest) throw new Error("Priest availability already exists for this priest , if want then update it");

  if(createPriestAvailabilityRequestBody.available_until && createPriestAvailabilityRequestBody.availability_status !== "available") {
    throw new Error("Available until cannot present while setting status as not available");
  } 
  if(createPriestAvailabilityRequestBody.next_available && createPriestAvailabilityRequestBody.availability_status !== "not_available") {
    throw new Error("Next available cannot be present while setting status as available");
  }
  
  return true;
}

export const validateEditPriestAvailabilityPayload = async (req) => {
  
  checkIsthereInvalidFields(editPriestAvailabilityAllowedFields, req.body);

  const priestAvailabilityDataId = req.params.priest_availability_id;
  if(!mongoose.Types.ObjectId.isValid(priestAvailabilityDataId)) {
    throw new Error(`${priestAvailabilityDataId} is not valid id`);
  }
  const exists = await PriestAvailability.findOne({_id: priestAvailabilityDataId});
  if(!exists) throw new Error("Priest availability data not found with id "+priestAvailabilityDataId);

  if(req.body.available_until && req.body.availability_status !== "available") {
    throw new Error("Available until cannot present while setting status as not available");
  } 
  if(req.body.next_available && req.body.availability_status !== "not_available") {
    throw new Error("Next available cannot be present while setting status as available");
  }
  return true;

}