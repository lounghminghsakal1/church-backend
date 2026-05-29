import mongoose from "mongoose";
import Priest from "../models/Priest.js";
import { checkIsthereInvalidFields, checkAllRequiredFieldsPresent } from "./generalHelpers.js";
import validator from "validator";

export const validatePriestAuthRequest = async (authPriestPayload) => {
    
    const requiredAndAllowedFields = ["priest_email", "priest_password"];
    checkIsthereInvalidFields(requiredAndAllowedFields, authPriestPayload);

    checkAllRequiredFieldsPresent(requiredAndAllowedFields, authPriestPayload);

    if(!validator.isEmail(authPriestPayload.priest_email)) {
      throw new Error("Invalid email id");
    }

    const priest = await Priest.findOne({priest_email: authPriestPayload.priest_email});
    if(!priest) {
      throw new Error("Priest not found with given email id: "+authPriestPayload.priest_email);
    }

    return priest;
}