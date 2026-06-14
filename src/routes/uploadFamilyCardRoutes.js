import express from "express";
import { authUser } from "../middlewares/authMiddlewares.js";
import uploadFamilyCard from "../config/multer.js";
import { familyCardUpload } from "../controllers/uploadFamilyCardController.js";

const uploadFamilyCardRouter = express.Router();

uploadFamilyCardRouter.post("", authUser, uploadFamilyCard.single("family_card") , familyCardUpload);

export default uploadFamilyCardRouter;
