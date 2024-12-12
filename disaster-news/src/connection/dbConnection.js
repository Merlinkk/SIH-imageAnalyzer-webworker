import mongoose from "mongoose";
import "dotenv/config";

// Use the Mongoose connection method to connect to MongoDB
export async function connectDB() {
  try {
    // Connect to the MongoDB server using the connection string from environment variables
    await mongoose.connect(process.env.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Successfully connected to AK db ");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process if the connection fails
  }
}

export { mongoose };
