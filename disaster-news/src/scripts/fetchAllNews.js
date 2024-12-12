import { sources } from "../models/news.js";

export default fetchAndSaveNews = async () => {
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
  
              const existingNews = await News.findOne({ link });
  
              if (!existingNews) {
                const newsItem = new News({
                  title,
                  link,
                  pubDate
                });
  
                await newsItem.save();
                newItemsCount++;
                console.log("News saved:", title);
              }
            } catch (itemError) {
              console.error("Error processing individual entry:", itemError);
            }
          }
  
          console.log(`Fetch complete. New items: ${newItemsCount}`);
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



// const disasterLinks = [
//   {
//     name: "Aaj Tak",
//     url: "https://www.aajtak.in/search/disaster?site=all,it,at,bt,btbz,gnt,atbn,mrt,guj,itml,itne,wce,ktak,ithi,uptak,mbtak,gjtak,rjtak,mptak,chtak,nwtak,crtak,itpod&ctype=story,photo_gallery&lang=all,hi,en,bn,ml,gu,mr&date=past_7_days"
//   },
//   {
//     name: "India Today",
//     url: "https://www.indiatoday.in/search/disaster?site=all,it,at,bt,btbz,gnt,atbn,mrt,guj,itml,itne,wce,ktak,ithi,uptak,mbtak,gjtak,rjtak,mptak,chtak,nwtak,crtak,itpod&ctype=all,story,video,photo_gallery,audio,visualstory&lang=all,hi,en,bn,ml,gu,mr&date=past_7_days"
//   },
//   {
//     name: "Times of India",
//     url: "https://timesofindia.indiatimes.com/topic/disaster"
//   },
//   {
//     name: "NDTV",
//     url: "https://www.ndtv.com/search?searchtext=disaster"
//   },
//   {
//     name: "Google News",
//     url: "https://news.google.com/search?q=disasters&hl=en-IN&gl=IN&ceid=IN%3Aen"
//   },
//   {
//     name: "ABP News",
//     url: "https://news.abplive.com/search?s=disaster"
//   }
// ];


// export default async function sourcesaver() {
//   // Iterate through the disasterLinks array
//   for (const source of disasterLinks) {
//     const { name, url } = source;
//     try {
//       // Create a new source document
//       const newSource = new sources({
//         name: name,
//         url: url,
//       });

//       // Wait for the source to be saved in the database
//       await newSource.save();

//       console.log("Source saved:", name);
//     } catch (err) {
//       console.error("Error saving source:", err);
//     }
//   }
// }