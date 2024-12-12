import "dotenv/config";
import { connectDB } from "./connection/dbConnection.js";
// import cron from "node-cron";

// import fu from "./scripts/fetchAllNews.js";
import { extractRelevantData } from "./scripts/webscraper1.js";
import { extractRelevantArticle } from "./scripts/webscraper2.js";



const startNewsUpdater = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");

    // await extractRelevantData();
    await extractRelevantArticle();
  } catch (error) {
    console.error("Failed to start news updater:", error);
    process.exit(1);
  }
};

startNewsUpdater();

process.on('SIGINT', () => {
  console.log('Shutting down news updater...');
  process.exit(0);
});