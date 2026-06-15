import mongoose from "mongoose";

const MeetingRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  },
  person_name: {
    type: String,
    required: true,
    trim: true
  },
  preferred_meeting_date_and_time: {
    type: Date,
    required: true,
    validate: {
      validator(value) {
        return value > Date.now()
      },
      message: "Preferred date must be in future"
    }
  },
  meeting_purpose: {
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

export default mongoose.model("MeetingRequest", MeetingRequestSchema);
