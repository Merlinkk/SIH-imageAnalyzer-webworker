import { MongoClient } from "mongodb";
import "dotenv/config";

const SMDB = new MongoClient(process.env.MONGODB_ATLAS_SOCIAL_MEDIA_DB);
const rawDB = new MongoClient(process.env.MONGODB_ATLAS_URI);

export async function connectDB() {
  try {
    await rawDB.connect();
    console.log("Successfully connected to raw sahyag");

    await SMDB.connect();
    console.log("Successfully connected to Socail media Db");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

export { rawDB, SMDB };
