import mongoose from "mongoose";

const BaptismRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
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
  child_name: {
    type: String,
    required: true,
    trim: true,
  },
  child_date_of_birth: {
    type: Date,
    required:true,
    validate: {
      validator(value) {
        return value < new Date();
      }, 
      message: "Child date of birth should be in past"
    }
  },
  preferred_baptism_date_and_time: {
    type: Date,
    required: true,
    validate: {
      validator(value) { 
        return value > new Date();
      },
      message: "Preferred date must be in the future"
    }
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"], 
    default: "pending",
    required: true
  },
  priest_response: {
    type: String,
    trim: true
  },
  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Priest"
  }

}, {timestamps: true});

export default mongoose.model("BaptismRequest", BaptismRequestSchema);