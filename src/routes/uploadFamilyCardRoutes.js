import express from "express";
import { authUserMiddleWare } from "../middlewares/authMiddlewares.js";
import uploadFamilyCard from "../config/multer.js";
import { familyCardUpload } from "../controllers/uploadFamilyCardController.js";

const uploadFamilyCardRouter = express.Router();

uploadFamilyCardRouter.post("", authUserMiddleWare, uploadFamilyCard.single("family_card") , familyCardUpload);

export default uploadFamilyCardRouter;
