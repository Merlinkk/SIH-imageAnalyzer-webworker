import { MongoClient } from "mongodb";
import "dotenv/config";

const clientDb = new MongoClient(process.env.MONGODB_ATLAS_URI);
const clientReport = new MongoClient(process.env.MONGODB_ATLAS_URI_REPORT)

let unfilteredPostsCollection;
let disasterPostsCollection;

export async function connectDB() {
  try {
    await clientDb.connect();
    unfilteredPostsCollection = clientReport.db().collection("unfilteredposts");
    disasterPostsCollection = clientReport.db().collection("disasterPosts");
    console.log("Successfully connected to Sahayog Database! \n");

    await clientReport.connect();
    console.log("Successfully connected to TrackReport Database! \n");

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

export { clientDb, unfilteredPostsCollection, disasterPostsCollection,clientReport };