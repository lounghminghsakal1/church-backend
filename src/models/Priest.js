import mongoose from "mongoose";

const PriestSchema = new mongoose.Schema({
  priest_name: {
    type: String,
    required: true,
    trim: true
  },
  priest_email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  priest_type: {
    type: String,
    enum: ["main_priest", "trainee"],
    required: true,
  },
  priest_password: {
    type: String,
    required: true,
    minlength: 8
  }
}, {timestamps: true});

export default mongoose.model("Priest", PriestSchema);