import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  pubDate: { type: Date, required: true },
})

const GlobalNews = mongoose.model("GlobalNews", NewsSchema);
export default GlobalNews;