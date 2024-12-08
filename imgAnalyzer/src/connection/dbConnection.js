import { MongoClient } from "mongodb";
import "dotenv/config";

const sahyogdb = new MongoClient(process.env.MONGODB_ATLAS_URI);
const AK = new MongoClient(process.env.MONGODB_ATLAS_URI_AK);

let disasterPostsCollection;

export async function connectDB() {
  try {
    await sahyogdb.connect();
    disasterPostsCollection = sahyogdb.db().collection("disasterPosts");
    console.log("Successfully connected to Shayog");

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

export { sahyogdb, disasterPostsCollection, AK };
