import { validateCreateUserPayload, validateUserLoginPayload } from "../../utils/authHelpers.js";
import { pickAllowedFields } from "../../utils/generalHelpers.js";
import { createUserAllowedFields } from "../../constants/userConstants.js";
import User from "../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const createUser = async (req, res) => {
  try{
    validateCreateUserPayload(req.body);

    const newUserPayload = pickAllowedFields(createUserAllowedFields, req.body);
    const hashedPassword = await bcrypt.hash(newUserPayload.user_password, 10);
    const newUser = await User.create({...newUserPayload, user_password: hashedPassword});
    res.json({
      status: "success",
      message: "User created successfully",
      data: newUser
    });

  } catch(err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to create user: "+err.message
    });
  }
}


export const userLogin = async (req, res) => {
  try {
    const user = await validateUserLoginPayload(req.body);
    const { user_email, user_password } = req.body;
    const isPasswordValid = await bcrypt.compare(user_password, user.user_password);
    if(!isPasswordValid) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid credentials"
      });
    }

    const userToken = await jwt.sign({userId: user?._id}, process.env.JWT_SECRET, {expiresIn: "1d"});
    res.cookie("userToken", userToken);    

    res.json({
      status: "success",
      message: "User logged in successfully",
      data: user
    });


  } catch(err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to login user: "+err.message
    });
  }
}


export const userLogout = (req, res) => {
  try{
    res.clearCookie("userToken");
    res.json({
      status: "success",
      message: "user logged out successfully"
    });
  } catch(err) {

  }
}