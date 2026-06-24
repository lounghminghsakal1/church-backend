import { updateUserAllowedFields } from "../constants/userConstants.js";
import User from "../models/User.js";
import { failureResponse, pickAllowedFields, successResponse, validateIdAndGiveThatDocument } from "../utils/generalHelpers.js";
import { validateUpdateUserPayload } from "../utils/userutils.js";

export const getUser = async (req, res) => {
  try { 
    res.json(successResponse("User data fetched successfully", req.user));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to fetch user data, "+err.message));
  }
}

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.user_id;
    if(!userId) throw new Error("User id is required");
    const userData = await validateIdAndGiveThatDocument(userId, User);
    if(!userData._id.equals(userId)) throw new Error("You cannot update other's data");
    validateUpdateUserPayload(req.body);
    const filteredPayload = pickAllowedFields(updateUserAllowedFields, req.body);
    const updatedUser = await User.findByIdAndUpdate(userId, filteredPayload, {new:true, runValidators: true });
    res.json(successResponse("User updated successfully", updatedUser));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to update user, "+err.message));
  }
}

