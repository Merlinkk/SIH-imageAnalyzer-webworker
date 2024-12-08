import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  pubDate: { type: Date, required: true },
});

const News = mongoose.model("News", NewsSchema);
export default News;