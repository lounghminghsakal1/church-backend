import mongoose from "mongoose";

const ConfirmationRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  },
  father_name: {
    type: String,
    required: true,
    trim: true
  },
  mother_name: {
    type: String,
    required: true,
    trim: true
  },
  confirmation_person_name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"],
    default: "pending"
  },
  priest_response: {
    type: String,
    trim: true
  },
  reviewed_by: {
    type: mongoose.Types.ObjectId,
    ref: "Priest"
  }
}, {timestamps: true});

export default mongoose.model("ConfirmationRequest", ConfirmationRequestSchema);
