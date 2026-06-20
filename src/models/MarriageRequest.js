import mongoose from "mongoose";

const MarriageRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User"
  },
  groom_name: {
    type: String,
    required: true,
    trim: true
  },
  bride_name: {
    type: String,
    required: true,
    trim: true
  },
  groom_location: {
    type: String,
    required: true,
    trim: true
  },
  bride_location: {
    type: String,
    required: true,
    trim: true
  },
  groom_mobile_number: {
    type: String,
    required: true,
    trim: true
  },
  bride_mobile_number: {
    type: String,
    required: true,
    trim: true
  },
  preferred_marriage_date_and_time: {
    type: Date,
    required: true,
    validate: {
      validator(value) {
        return value > new Date()
      },
      message: "Preferred marriage date must be in the future"
    }
  },
  status: {
    type: String, 
    enum: ["pending", "approved", "rejected", "cancelled"],
    default: "pending"
  },
  priest_response: {
    type: String,
    default: ""
  },
  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Priest"
  },
  frontend_message: {
    type: String,
    default: "Please ensure family card of user has either groom's name or bride's name (show this to user and also give option to show their uploaded family card and give option to replace also)"
  }
});

export default mongoose.model("MarriageRequest", MarriageRequestSchema);

