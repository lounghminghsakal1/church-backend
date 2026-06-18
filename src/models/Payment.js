import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
   payment_mode: {
    type: String,
    enum: ["online", "offline"],
    required: true,
    default: "offline"
  },
  amount: {
    type: Number,
    required: true,
    default: 200
  },
  payment_for: {
    type: String,
    enum: ["mass_prayer", "donations", "festival_donation"],
    required: true
  },
  payment_status: {
    type: String,
    required: true,
    enum: ["not_opted", "completed", "failed", "pending"],
    default: "not_opted"
  },
  payment_id: {
    type: String, 
    default: null
  },
}, {timestamps: true});

export default mongoose.model("Payment", PaymentSchema);

