import { MongoClient } from "mongodb";
import "dotenv/config";

const sahyog = new MongoClient(process.env.MONGODB_ATLAS_URI);

export async function connectDB() {
  try {
    await sahyog.connect();
    console.log("Successfully connected to Shayog");

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

export { sahyog };
