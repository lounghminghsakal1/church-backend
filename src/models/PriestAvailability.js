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
  },
  reminder: {
    type: new mongoose.Schema({
      sent_at: { type: Date, default: null },
      lease_until: { type: Date, default: null },
      token: { type: String, default: null },
      retry_at: { type: Date, default: null },
      attempts: { type: Number, default: 0 }
    }, { _id: false }),
    default: () => ({}),
    select: false
  }
  },
  { timestamps: true }
);

PriestAvailabilitySchema.index({ availability_status: 1, available_until: 1 });
PriestAvailabilitySchema.index({ availability_status: 1, next_available: 1 });

export default mongoose.model("PriestAvaialability", PriestAvailabilitySchema);

