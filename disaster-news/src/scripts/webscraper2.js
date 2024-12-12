import { llm } from "../llm/GoogleGenerativeAI";
import {
  disasterNewsDatabase,
  DisasterNewsStageOne,
  DisasterNewsStageTwo,
} from "../models/news";

// const disasterArticleSchema = `
// {
//   type: string (required. for example flood, earthquake, cyclone, storm ),
//   location: {
//     city: string | null (optional),
//     state: string | null (optional),
//     country: string | null (optional),
//     coordinates: {
//       latitude: number | null (optional),
//       longitude: number | null (optional)
//     } (optional)
//   } (optional),
//   summary: string | null (optional),
// }
// `;

export async function extractRelevantArticle() {
  const current_date = new Date().toUTCString();

  const stageOneData = await DisasterNewsStageOne.find();

  for (const article of stageOneData) {
    const scrapedWebsite = await fetch(`https://r.jina.ai/${article.url}`);

    const stringArticle = JSON.stringify(article);

    let textResponse = await scrapedWebsite.text();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const prompt = `
        This is scraped data from a news website for the article titled "${article.title}". Below is the scraped data:
        ${textResponse}
        
        Please process and format the following data, referencing this JSON object:
        ${disasterNewsDatabase}
        
        The scraped data is from a search result for the term "disaster." Focus on identifying articles specifically related to **ongoing or recent natural disaster events** such as floods, earthquakes, cyclones, storms, etc. Follow these rules:
        
        1. **Validation**:
           - If the article is **not disaster-related**, or does not depict an ongoing or recent disaster situation, return "FALSE".
           - Use this date: ${current_date} to determine if the event occurred **within the last 7 days**.
           - If the article's date is missing ('null'), replace it with the current date (${current_date}).
        
        2. **Data Extraction**:
           - Use the domain of the URL as the 'source' if no specific source is available.
           - Include the 'url' of the article.
           - Create a concise summary (100-150 words), capturing the main points of the article. Ensure it covers all relevant details of the disaster.
        
        3. **Output Format**:
           - Adhere to this schema strictly:
             {
           "type": {"type": "String", "required": true}, (can be of type Earthquake | Tsunami | Volcanic eruption | Landslide | Avalanche | Rockfall | Sinkhole | Flood | Flash flood | Storm surge | River flood | Coastal flood | Dam failure | Drought | Cyclone | Hurricane | Typhoon | Tornado | Tropical storm | Blizzard | Heatwave | Cold wave | Windstorm | Dust storm | Sand storm | Wildfire (Forest fire) | Bushfire | Grassland fire | Grassfire | Bushland fire | Alpine fire if these apply or get them from the post itself)
               "title": { "type": "String", "required": true },
               "url": { "type": "String", "required": true },
               "source": { "type": "String", "required": true },
               "date": { "type": "String", "required": true },
               "summary": { "type": "String", "required": true,
               location: {
                    city: string, (can be district or city, use the post data provided to get this)
                    state: string,
                    country: string,
                    coordinates: {
                      latitude: number,
                      longitude: number
                    }
                },

             }
        
        4. **Additional Notes**:
           - Exclude articles that only mention disasters in passing without providing updates or significant information.
           - Ensure all output is in valid JSON format and accurately reflects the schema.
           - this is the origial article object ${stringArticle}, reference this is there are some null values
           - Fill in the state, country, city yourself as far as possible even if it's not specified in the description.
            - Fill in the coordinates of respective location as well.
        
        Given this context, process the data and return the result.
        `;

      console.log("involing llm");
      const response = await llm.invoke(prompt);
      const responseContent = response.content.trim();
      console.log("llm operation done");

      const startIndex = responseContent.indexOf("{");
      const endIndex = responseContent.lastIndexOf("}");
      if (startIndex === -1 && endIndex === -1) {
        console.log(`Skipping.`);
        return;
      }

      const jsonString = responseContent.substring(startIndex, endIndex + 1);

      console.log("THIS IS JSON STRING->>>>>>", jsonString);

      try {
        const disasterData = JSON.parse(jsonString);
        console.log(disasterData);
        const existing = await DisasterNewsStageTwo.findOne({
          url: disasterData.url,
        });
        if (existing) {
          console.log("Skipping.....");
          continue;
        }
        console.log("NEW ARTICLE ->>>>", disasterData);
        const disasterPost = new DisasterNewsStageTwo(disasterData);
        await disasterPost.save();
        console.log("Saved disaster post:", disasterData);
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
