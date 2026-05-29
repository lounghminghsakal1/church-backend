import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected Successfully");
  } catch(err) {
    console.log("DB Connection Error: "+err.message);
  }
}

export default connectDB;
