import express from "express";
import { authUserMiddleWare } from "../middlewares/authMiddlewares.js";
import { familyCardUpload } from "../controllers/uploadFamilyCardController.js";
import createFileUploader from "../config/multer.js";

const uploadFamilyCardRouter = express.Router();

const uploadFamilyCard = createFileUploader("family_cards");

uploadFamilyCardRouter.post("", authUserMiddleWare, uploadFamilyCard.single("family_card") , familyCardUpload); //"family_card" that is the argument inside uploadFamilyCard.single() function is the key name which frontend has to use to send the image or file to backend

export default uploadFamilyCardRouter;
