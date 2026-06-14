import jwt from "jsonwebtoken";
import Priest from "../models/Priest.js";
import mongoose from "mongoose";
import User from "../models/User.js";

export const authPriestMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        status: "failure",
        message: "Token not found, please login"
      });
    }

    const decodedMessage = await jwt.verify(token, process.env.JWT_SECRET);
    
    if (!mongoose.Types.ObjectId.isValid(decodedMessage.priestId)) {
      throw new Error("Invalid id");
    }

    const priest = await Priest.findOne({ _id: decodedMessage.priestId });
    if (!priest) {
      return res.status(404).json({
        status: "failure",
        message: "Priest not found"
      });
    }

    req.priest = priest;
    next();

  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: "Priest auth failed: "+err.message
    });
  }

}


export const authUserMiddleWare = async (req, res, next) => {
  try {
    const userToken = req.cookies.userToken;
    if(!userToken) {
      return res.status(404).json({
        status: "failure",
        message: "Auth user failed, token not found"
      });
    }
    
    const { userId } = await jwt.verify(userToken, process.env.JWT_SECRET);
    const user = await User.findById(userId);
    if(!user) {
      return res.status(404).json({
        status: "failure",
        message: "Auth user failed, user not found"
      });
    } 

    req.user = user;
    next();

  } catch(err) {

  }
}