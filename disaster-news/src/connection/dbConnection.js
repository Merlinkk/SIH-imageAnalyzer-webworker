import { MongoClient } from "mongodb";
import "dotenv/config";

const newsDB = new MongoClient(process.env.mongoURI);

export async function connectDB() {
  try {
    await newsDB.connect();
    console.log("Successfully connected to AK db ");

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

export { newsDB };
