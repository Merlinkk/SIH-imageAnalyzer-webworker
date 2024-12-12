import { llm } from "../llm/GoogleGenerativeAI";
import { disasterNewsSchema, DisasterNewsStageOne, sources } from "../models/news";

// const scrapingURL =

function measureWordCount(data) {
  const words = data.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
}

const sample = {
    "title":"Kerala pushes for increased central tax share, disaster relief aid",
    "url":"https://www.indiatoday.in/india/kerala/story/kerala-wants-16th-finance-commission-to-hike-central-tax-share-increased-disaster-relief-aid-2648145-2024-12-11?utm_source=global-search&utm_medium=global-search&utm_campaign=global-search",
    "source":"India Today",
    "date":"Dec 11, 2024"
}

export async function extractRelevantData() {
  const current_date = new Date().toUTCString();

  const newsSources = await sources.find();

  for (const source of newsSources) {
    const scrapedWebsite = await fetch(`https://r.jina.ai/${source.url}`);

    let textResponse = await scrapedWebsite.text();

    const wordCount = measureWordCount(textResponse);
    console.log("before", wordCount);

    if (wordCount > 750) {
        const startKeywords = [/disaster News/i, /"disaster"/i, /News Result/i, /search\?s=disaster&format=news/i]; // Start keywords
      const endKeywords = [/Video Result/i, /load more/i, /"Previous Page"/i]; // End keywords
      startKeywords.sort((a, b) => b.length - a.length);
      endKeywords.sort((a, b) => b.length - a.length);

      let startIndex = -1;
      let endIndex = -1;

      // Find the first occurrence of any start keyword
      for (const keyword of startKeywords) {
        const index = textResponse.toLowerCase().search(keyword);
        if (index !== -1 && (startIndex === -1 || index < startIndex)) {
          startIndex = index;
        }
      }

      // Find the first occurrence of any end keyword
      for (const keyword of endKeywords) {
        const index = textResponse.search(keyword);
        if (index !== -1 && (endIndex === -1 || index < endIndex)) {
          endIndex = index;
        }
      }

      if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        textResponse = textResponse.slice(
          startIndex,
          endIndex + "Load More".length
        );
        console.log("Shortened textResponse:", measureWordCount(textResponse));
      } else {
        console.warn("\nCould not slice as no keyword found \n.");
      }

      console.log(`\n \n \n https://r.jina.ai/${source.url} \n \n \n`);

      await new Promise((resolve) => setTimeout(resolve, 2000));

          try {

            const prompt = `
       This is a scraped data of a news website search result page on disasters :
        ${textResponse}
        Please extract and format the following data referencing from this JSON object:
        ${disasterNewsSchema}

        As thie scraped data is from a search result look for "disaster" search result in the data.

        If the articles are relates to ongoing or current natural disaster events such as floods, earthquakes, cyclones, storms, etc., return a valid JSON string according to the ${sample} given. Ensure:
        - If the post is not disaster-related, return "FALSE".
        - use this date ${current_date} to ensure if this was in the last 7 days.
        - replace the date with the date above if the date value is null 
        - the source can be taken a the url domain as well. 
        - make sure to have the url as the property as well
        `;
              console.log("involing llm");
            const response = await llm.invoke(prompt);
            const responseContent = response.content.trim();
            console.log("llm operation done");

            const startIndex = responseContent.indexOf("[");
            const endIndex = responseContent.lastIndexOf("]");
            if (startIndex === -1 && endIndex === -1) {
              console.log(`Skipping.`);
              return;
            }

            const jsonString = responseContent.substring(startIndex, endIndex + 1);

            console.log("THIS IS JSON STRING->>>>>>",jsonString);

            try {
              const disasterData = JSON.parse(jsonString);
              for (const disaster of disasterData) {
                  const existing = await DisasterNewsStageOne.findOne({url : disaster.url});
                  if(existing){
                      console.log("Skipping.....")
                      continue;
                  }
                  console.log("NEW ARTICLE ->>>>",disaster);
                  const disasterPost = new DisasterNewsStageOne(disaster);
                  await disasterPost.save();
                  console.log("Saved disaster post:", disaster);
              }
            } catch (error) {
              console.error("Error parsing JSON:", error);
              return null;
            }

          }catch(err){
              console.log(err);
          }
    }
  }
}
