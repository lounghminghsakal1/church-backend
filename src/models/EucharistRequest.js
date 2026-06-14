import mongoose from "mongoose";

const EucharistRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User"
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
  eucharist_person_name: {
    type: String,
    required: true,
    trim: true
  },
  preferred_eucharist_date_and_time: {
    type: Date,
    required: true,
    validate: {
      validator(value) {
        return value > new Date();
      },
      message: "Preferred eucharist getting date must be in the future"
    }
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

export default mongoose.model("EucharistRequest", EucharistRequestSchema);