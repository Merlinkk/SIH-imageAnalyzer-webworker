import { GoogleGenerativeAI } from "@google/generative-ai";
import { sahyogdb } from "../connection/dbConnection";

import { updateDatabase } from "../postService/dataPoster";


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

// const disasterPostSchema = `
// {
//   "type": "string",
//   "location": {
//     "city": "string",
//     "state": "string",
//     "country": "string"
//   },
//   "coordinates": {
//     "timestamp": "string (ISO 8601 format)"
//   },
//   "description": "string",
//   image : "string(url)"
// }
//   `

// Translation function

const disasterPostSchema = `
{
  type: string (required. for example flood, earthquake, cyclone, storm ),
  location: {
    city: string | null (optional),
    state: string | null (optional),
    country: string | null (optional),
    coordinates: {
      latitude: number | null (optional),
      longitude: number | null (optional)
    } (optional)
  } (optional),
  timestamp: string | null (optional),
  description: string | null (optional),
}
`;

async function translate(inputText, inputLanguage, outputLanguage = "en") {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage}&dt=t&q=${encodeURI(inputText)}`;
  try {
    const response = await fetch(url);
    const json = await response.json();
    return json[0].map((item) => item[0]).join("");
  } catch (error) {
    console.error("Translation error:", error);
    return inputText; // Fallback to original text if translation fails
  }
}

// Helper function to create a delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// MongoDB connection helper
async function saveToDatabase(postObject) {
  try {
    const db = sahyogdb.db();
    const collection = db.collection("dbstorefiltered");
    await collection.insertOne(postObject);
    console.log("Post saved to the filtered database. -> ", postObject);
  } catch (error) {
    console.error("Error saving post to database:", error);
  }
}


export default async function analyzePosts(posts) {
  let data = "";
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const { text, imageUrl, language = "auto" } = post.post;

      console.log("\nAnalyzing post:", text, imageUrl, "\n");

      if (!imageUrl) continue; // Skip if no image is provided

      // Translate text to English before analyzing
      const translatedText = await translate(text, language, "en");

      // Fetch the image data as an ArrayBuffer
      const imageResp = await fetch(imageUrl)
        .then((response) => response.arrayBuffer())
        .catch((error) => {
          console.error(`Error fetching image for post ID ${post._id}:`, error);
          return null;
        });

      if (!imageResp) continue; // Skip to the next post if image fetch fails

      // Prepare the payload for generating content
      const result = await model.generateContent([
        {
          inlineData: {
            data: Buffer.from(imageResp).toString("base64"),
            mimeType: "image/jpeg", // Adjust MIME type dynamically if needed
          },
        },
        `Analyze if the following content is related to a disaster: "${translatedText}".

If the content is related to natural disaster events such as floods, earthquakes, cyclones, storms, etc., extract and format the data according to the ${disasterPostSchema} from the provided JSON object:

1. Return a valid JSON string without code block formatting.
2. Use double quotes for all properties and values.
3. Fill in the state, country, and city, even if they are not explicitly mentioned.
4. Provide the geographic coordinates for the respective location based on the city or region.
5. Omit optional fields if they are not available.
6. Generate a suitable description if the provided one is null.
7. Use the following description format: "<Disaster Type> in <City, State, Country> <Short summary of the event>." Make sure it is descriptive.
8. Assign appropriate values for all non-optional fields.
9. If the post is not related to a disaster, return "FALSE" as a string.`,
      ]);

      let generatedText = result.response.text();

      console.log("Raw AI Response:", generatedText);
      const startIndex = generatedText.indexOf("{");
      const endIndex = generatedText.lastIndexOf("}");
      if (startIndex === -1 && endIndex === -1) {
        console.log(`Post ID ${post._id} is not disaster-related. Skipping.`);
        continue;
      }

      // Clean up backticks or any unexpected formatting
      generatedText = generatedText.replace(/```json|```/g, "").trim();

      try {
        const generatedPost = {
          transformedPost : {...JSON.parse(generatedText)}, // Parse the cleaned JSON
          originalPost : post
        };

        console.log(generatedPost);

        // Save to MongoDB
        await saveToDatabase(generatedPost);

        // update database
        updateDatabase(generatedPost);

        // Append to final data
        data += JSON.stringify(generatedPost) + " \n ";
      } catch (parseError) {
        console.error(
          `Error parsing AI-generated JSON for post ID ${post._id}:`,
          parseError,
          "\nGenerated Text:",
          generatedText
        );
      }

      // Introduce a 15-second delay to achieve 4 posts per minute
      if (i < posts.length - 1) {
        await sleep(15000); // Delay of 15,000 milliseconds (15 seconds)
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }

  return data;
}