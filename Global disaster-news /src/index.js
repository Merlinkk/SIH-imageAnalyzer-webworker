import axios from "axios";
import xml2js from "xml2js";
import GlobalNews from "./models/globalnews.js";
import "dotenv/config";
import connectDB from "./connection/dbConnection.js"
import cron from "node-cron";

const RSS_FEED_URL = 'https://www.google.co.in/alerts/feeds/06503570563963071000/2508653008574496790';


const fetchAndSaveNews = async () => {
  try {
    console.log("Fetching RSS feed...");
    const response = await axios.get(RSS_FEED_URL);
    
    const parser = new xml2js.Parser({ 
      explicitArray: true, 
      trim: true, 
      normalize: true 
    });

    return new Promise((resolve, reject) => {
      parser.parseString(response.data, async (err, result) => {
        if (err) {
          console.error("XML Parsing error:", err);
          return reject(err);
        }

        if (!result || !result.feed || !result.feed.entry) {
          console.error("Unexpected feed structure");
          return reject(new Error("Invalid feed structure"));
        }

        const entries = result.feed.entry;
        let newItemsCount = 0;
        
        for (const entry of entries) {
          try {
            const title = entry.title[0]._.replace(/<\/?b>/g, '');
            const link = entry.link[0].$.href;
            const pubDate = new Date(entry.published[0]);

            const existingNews = await GlobalNews.findOne({ link });

            if (!existingNews) {
              const newsItem = new GlobalNews({
                title,
                link,
                pubDate
              });

              await newsItem.save();
              newItemsCount++;
              console.log("News saved:", title);
            }else{
              console.log("Existing news found. Skipping")
            }
          } catch (itemError) {
            console.error("Error processing individual entry:", itemError);
          }
        }

        console.log(`Fetch complete. New items: ${newItemsCount}`);
        console.log(Date(Date.now()).toString());
        resolve(newItemsCount);
      });
    });
  } catch (error) {
    console.error("Error fetching RSS feed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

const startNewsUpdater = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");

    await fetchAndSaveNews();

    cron.schedule('*/15 * * * *', async () => {
      try {
        await fetchAndSaveNews();
      } catch (error) {
        console.error("Scheduled fetch failed:", error);
      }
    });

    console.log("Autonomous news updater started. Fetching every 15 minutes.");
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