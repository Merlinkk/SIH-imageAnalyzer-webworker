import axios from "axios";
import xml2js from "xml2js";
import News from "./models/news";
import "dotenv/config";
import { connectDB } from "./connection/dbConnection";

const RSS_FEED_URL = 'https://www.google.co.in/alerts/feeds/06503570563963071000/1095517030166254058';

await connectDB();

const fetchAndSaveNews = async () => {
  try {
    const response = await axios.get(RSS_FEED_URL);
    
    const parser = new xml2js.Parser({ 
      explicitArray: true, 
      trim: true, 
      normalize: true 
    });

    parser.parseString(response.data, async (err, result) => {
      if (err) {
        console.error("XML Parsing error:", err);
        return;
      }

      if (!result || !result.feed || !result.feed.entry) {
        console.error("Unexpected feed structure");
        return;
      }

      const entries = result.feed.entry;
      
      for (const entry of entries) {
        try {
          // Strip HTML tags from title
          const title = entry.title[0]._.replace(/<\/?b>/g, '');
          const link = entry.link[0].$.href;
          const pubDate = new Date(entry.published[0]);

          // Check if news item already exists
          const existingNews = await News.findOne({ link });

          if (!existingNews) {
            // Create and save new news item
            const newsItem = new News({
              title,
              link,
              pubDate
            });
            console.log(newsItem);
            await newsItem.save();
            console.log("News saved:", title);
          } else {
            console.log("News already exists:", title);
          }
        } catch (itemError) {
          console.error("Error processing individual entry:", itemError);
        }
      }
    });

  } catch (error) {
    console.error("Error fetching RSS feed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
};

fetchAndSaveNews();