import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
    trim: true
  },
  user_email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  user_mobile_number: {
    type: String,
    required: true,
    trim: true
  },
  user_password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8
  },
  prayer_group: {
    type: String,
    enum: ["St.Antony prayer group", "St.Mary prayer group", "Vellai mariyal prayer group"],
    required: true,
  },
  church_organizations: {
    type: [String],
    enum: ["Vincent de paul organization", "Younger services group", "Women services group"],
    default: []
  },
  spouse_name: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  family_card_number: {
    type: String,
    trim: true
  },
  family_card_document_url: {
    type: String
  },
  is_verified: Boolean
}, {timestamps: true});

export default mongoose.model("User", UserSchema);
