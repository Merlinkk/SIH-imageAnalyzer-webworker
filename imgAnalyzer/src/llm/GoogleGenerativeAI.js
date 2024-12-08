import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const llm = new ChatGoogleGenerativeAI({
  model: "gemini-pro",
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});
