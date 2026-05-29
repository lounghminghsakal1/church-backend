import mongoose from "mongoose";

const PriestAvailabilitySchema = new mongoose.Schema({
  priest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Priest",
    required: true,
  },
  availability_status: {
    type: String,
    enum: ["available", "not_available", "not_set"],
    default: "not_set",
    required: true,
  },
  available_until: {
    type: Date,
    default: null
  },
  next_available: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  }
  },
  { timestamps: true }
);

export default mongoose.model("PriestAvaialability", PriestAvailabilitySchema);

