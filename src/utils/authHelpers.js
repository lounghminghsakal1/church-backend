import mongoose from "mongoose";
import Priest from "../models/Priest.js";
import { checkIsthereInvalidFields, checkAllRequiredFieldsPresent } from "./generalHelpers.js";
import { createUserAllowedFields, createUserRequiredFields } from "../constants/userConstants.js";
import validator from "validator";
import User from "../models/User.js";

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

export const validateCreateUserPayload = (createUserPayload) => {
  checkIsthereInvalidFields(createUserAllowedFields, createUserPayload);

  checkAllRequiredFieldsPresent(createUserRequiredFields, createUserPayload);

  if(!validator.isEmail(createUserPayload.user_email)) {
    throw new Error("Invalid email id");
  }

  const { user_password } = createUserPayload;
  if (user_password.length < 8) {
    throw new Error("Password length must be atleast 8 characters including numbers and special characters");
  }

  if(createUserPayload.user_mobile_number.length !== 10) {
    throw new Error("Mobile number must be of 10 digits");
  }

  if(createUserPayload.family_card_document_url && !validator.isURL(createUserPayload.family_card_document_url)) {
    throw new Error("Invalid url for family card");
  }

}

export const validateUserLoginPayload = async (userLoginPayload) => {
  const userLoginAllowedAndRequiredFields = ["user_email", "user_password"];
  checkIsthereInvalidFields(userLoginAllowedAndRequiredFields, userLoginPayload);
  checkAllRequiredFieldsPresent(userLoginAllowedAndRequiredFields, userLoginPayload);
  const {user_email, user_password} = userLoginPayload;
  if(!validator.isEmail(user_email)) {
    throw new Error("invalid email id");
  }
  const user = await User.findOne({user_email: user_email});
  if(!user) {
    throw new Error("User not found");
  }
  return user;
}