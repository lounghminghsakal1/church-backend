import mongoose from "mongoose";

const MassPrayerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  mass_prayer_date_and_time: {
    type: Date,
    required: true,
    validate: {
      validator(value) {
        return value > new Date();
      },
      message: "Mass prayer date and time must be in the future"
    }
  },
  mass_prayer_image: {
    file_name: String,
    file_path: String,
    updated_at: Date
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Payment"
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
  }
}, {timestamps: true});

export default mongoose.model("MassPrayer", MassPrayerSchema);
