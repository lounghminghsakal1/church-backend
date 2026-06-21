import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validatePriestAuthRequest } from "../../utils/authHelpers.js";
import mongoose from "mongoose";
import Priest from "../../models/Priest.js";

export const authPriest = async (req, res) => {
  try {
    const priest = await validatePriestAuthRequest(req.body);

    const { priest_email, priest_password } = req.body;
    const isPasswordCorrect = await bcrypt.compare(priest_password, priest.priest_password);
    if (!isPasswordCorrect) {
      throw new Error("Invalid credentials");
    }
    const token = await jwt.sign({ priestId: priest._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, {
      httpOnly: true, // frontend js cannot access it - blocking xss attacks
      secure: true, // for development purpose, if true means send cookie over https only but now in localhost its http so false or use process.env.NODE_ENV==="production"
      sameSite: "none", //cookie preserves across other websites (used when frontend and backend are on different domains)
      maxAge: 1 * 24 * 60 * 60 * 1000 // how long cookie presents
    });

    res.json({
      status: "success",
      message: "Priest login successful",
      data: priest
    });

  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to login priest: " + err.message,
    })
  }
}

export const getLoggedInPriest = async (req, res) => {
  try {
    const token = req.cookies.token;
    if(!token) throw new Error("Token not found, please login again");
    const decodedMessage = await jwt.verify(token, process.env.JWT_SECRET);
    const { priestId } = decodedMessage;
    if(!mongoose.Types.ObjectId.isValid(priestId)) throw new Error("Invalid priest id");
    const loggedInPriest = await Priest.findById(priestId);
    if(!loggedInPriest) throw new Error("Priest not found");
    res.json({
      status: "success",
      message: "Logged in priest data got for to solve data lost in use context when refresh",
      data: loggedInPriest
    });

  } catch(err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to get logged in priest data: "+err.message
    })
  }
}

export const logoutPriest = async (req, res) => {
  try {
    // const token = req.cookies.token;
    // if(!token) {
    //   res.status(404).json({
    //     status: "failure",
    //     message: "Token not found"
    //   });
    // }
    res.clearCookie("token", {
      httpOnly: true, 
      secure: false,
      sameSite: "lax"
    });
    res.json({
      status: "success",
      message: "Logged out successfullly"
    });

  } catch(err) {

    // I think no error handling needed here , if needed i will update it later

  }
}
