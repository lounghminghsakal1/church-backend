import mongoose from "mongoose";

const ConfessionRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User"
  },
  confession_person_name: {
    type: String,
    required: true,
    trim: true
  },
  preferred_confession_date_and_time: {
    type: Date,
    required: true,
    validate: {
      validator(value) {
        return value > new Date()
      },
      message: "Preferred date must be in the future"
    }
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"],
    default: "pending"
  },
  priest_response: {
    type: String,
    trim: true,
    default: ""
  },
  reviewed_by: {
    type: mongoose.Types.ObjectId,
    ref: "Priest"
  }
});

export default mongoose.model("ConfessionRequest", ConfessionRequestSchema);
