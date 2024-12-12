import mongoose from "mongoose";
import "dotenv/config";

export default async function connectDB (){
  try {
    await mongoose.connect(process.env.mongoURI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

