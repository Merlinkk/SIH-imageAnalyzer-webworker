import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: "AIzaSyBS0IulkAwhpwpgDt1u4O2YsSzMIx3k-4E",
});

// GOOGLE_GENAI_API_KEY=AIzaSyB0Hp3w3OiMSW9T4ebTG4A5G2XWLQ5HPWM