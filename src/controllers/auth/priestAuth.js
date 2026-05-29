import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validatePriestAuthRequest } from "../../utils/authHelpers.js";

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
      secure: false, // for development purpose, if true means send cookie over https only but now in localhost its http so false or use process.env.NODE_ENV==="production"
      sameSite: "lax", //cookie preserves across other websites (used when frontend and backend are on different domains)
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