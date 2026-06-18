import express from "express";
import { authUserMiddleWare } from "../middlewares/authMiddlewares.js";
import { familyCardUpload } from "../controllers/uploadFamilyCardController.js";
import createFileUploader from "../config/multer.js";

const uploadFamilyCardRouter = express.Router();

const uploadFamilyCard = createFileUploader("family_cards");

uploadFamilyCardRouter.post("", authUserMiddleWare, uploadFamilyCard.single("family_card") , familyCardUpload);

export default uploadFamilyCardRouter;
