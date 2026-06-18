import express from "express";
import { authUserMiddleWare } from "../middlewares/authMiddlewares.js";
import createFileUploader from "../config/multer.js";
import { cancelMassPrayer, createMassPrayer, getAllMassPrayers, getOneMassPrayer, updateMassPrayer } from "../controllers/massPrayerController.js";

const massPrayerRouter = express.Router();

const massPrayerImageUploader = createFileUploader("mass_prayer_images");

massPrayerRouter.post("/", authUserMiddleWare, massPrayerImageUploader.single("mass_prayer_image"), createMassPrayer);

massPrayerRouter.patch("/:mass_prayer_id", authUserMiddleWare, massPrayerImageUploader.single("mass_prayer_image") ,updateMassPrayer);

massPrayerRouter.get("/:mass_prayer_id", authUserMiddleWare, getOneMassPrayer);

massPrayerRouter.get("/", authUserMiddleWare, getAllMassPrayers);

massPrayerRouter.post("/:mass_prayer_id/cancel", authUserMiddleWare, cancelMassPrayer);

export default massPrayerRouter;