import MassPrayer from "../models/MassPrayer.js";
import Payment from "../models/Payment.js";
import { failureResponse, successResponse, validateIdAndGiveThatDocument } from "../utils/generalHelpers";
import { validateCreateMassPrayerPayload, validateUpdateMassPrayerPayload } from "../utils/massPrayerUtils.js";

export const createMassPrayer = async (req, res) => {
  try {
    validateCreateMassPrayerPayload(req.body);
    if(!req.file) throw new Error("Mass prayer image is required");
    const newPayment = await Payment.create({
      payment_mode: req.body.payment_mode,
      payment_for: "mass_prayer",
      amount: 200,
      payment_status: req.body.status === "offline" ? "not_opted" : "pending"
    });

    const newMassPrayer = await MassPrayer.create({
      user: req.user._id,
      mass_prayer_date_and_time: req.body.mass_prayer_date_and_time,
      mass_prayer_image: {
        file_name: req.file.originalname,
        file_path: req.file.path,
        updated_at: Date.now()
      },
      payment: newPayment._id,      
    });

    res.json(successResponse("Mass prayer created successfully"));

  } catch(err) {
    res.status(400).json(failureResponse("Failed to create mass prayer, "+err.message));
  }
}

export const updateMassPrayer = async (req, res) => {
  try {
    const massPrayerId = req.params.mass_prayer_id;
    if(!massPrayerId) throw new Error("Mass prayer id is required");
    const oldMassPrayer = await validateIdAndGiveThatDocument(massPrayerId, MassPrayer);
    if(!oldMassPrayer.user.equals(req.user._id)) throw new Error("You cannot edit someone's mass prayer");
    if(oldMassPrayer.status !== "pending") throw new Error("Only mass prayer with pending status can be edited");
    const oldMassPrayerPaymentId = oldMassPrayer.payment;
    const oldMassPrayerPayment = await Payment.findById(oldMassPrayerPaymentId); // i am sure its valid mongoose object id because i am getting it from another document so no need of validation of id here (validateIdAndGiveThatDocument) 
    if(!oldMassPrayerPayment) throw new Error("Mass prayer's payment not found");
    if(oldMassPrayerPayment.payment_status === "completed") throw new Error("Payment successfully completed for this Mass Prayer so you can't edit it");
    validateUpdateMassPrayerPayload(req.body);
    if(req.body.payment_mode) {
      await Payment.findByIdAndUpdate(oldMassPrayerPaymentId, {payment_mode: req.body.payment_mode, payment_status: req.body.payment_mode === "online" ? "pending" : "not_opted"});
    }
    const updatedMassPrayer = await MassPrayer.findByIdAndUpdate(massPrayerId, {mass_prayer_date_and_time: req.body.mass_prayer_date_and_time, mass_prayer_image: {file_name: req.file.originalname, file_path: req.file.path, updated_at: Date.now()}}, {new:true});
    res.json(successResponse("Mass prayer updated successfully", updatedMassPrayer));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to update mass prayer, "+err.message));
  }
}

export const getOneMassPrayer = async (req, res) => {
  try {
    const massPrayerId = req.params.mass_prayer_id;
    if(!massPrayerId) throw new Error("Mass prayer id required");
    const massPrayer = await validateIdAndGiveThatDocument(massPrayerId, MassPrayer);
    res.json(successResponse("Mass prayer fetched successfully", massPrayer));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to fetch mass prayer, "+err.message));
  }
}

export const getAllMassPrayers = async (req, res) => {
  try {
    const allMassPrayers = await MassPrayer.find({user: req.user._id});
    res.json(successResponse("All mass prayers fetched successfully", allMassPrayers));
  } catch(err) {
    res.status(400).json(failureResponse("Failed to fetch all mass prayers, "+err.message));
  }
}

export const cancelMassPrayer = async (req, res) => {
  try {
    const massPrayerId = req.params.mass_prayer_id;
    if(!massPrayerId) throw new Error("Mass prayer id is required");
    const massPrayer = await validateIdAndGiveThatDocument(massPrayerId, MassPrayer);
    if(massPrayer.status !== "pending") throw new Error("Only pending mass prayer can be cancelled");
    const cancelledMassPrayer = await MassPrayer.findByIdAndUpdate(massPrayerId, {status: "cancelled"}, {new: true});
    res.json("Mass prayer cancelled successfully", cancelledMassPrayer);
  } catch(err) {
    res.status(400).json(failureResponse("Failed to cance Mass prayer, "+err.message));
  }
}