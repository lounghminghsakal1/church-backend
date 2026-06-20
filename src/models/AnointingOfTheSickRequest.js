import mongoose from "mongoose";

const AnointingOfTheSickRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User"
  },
  patient_name: {
    type: String,
    required: true,
    trim: true,
  },
  patient_condition: {
    type: String,
    required: true,
    trim: true
  },
  patient_address: {
    type: String,
    required: true,
    trim: true
  },
  contact_number: {
    type: String,
    required: true,
    trim: true
  },
  relationship_to_patient: {
    type: String,
    trim: true
  },
  is_urgent: {
    type: Boolean,
    required: true
  },
  preferred_visit_date_and_time: {
    type: Date,
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

export default mongoose.model("AnointingOfTheSickRequest", AnointingOfTheSickRequestSchema);
