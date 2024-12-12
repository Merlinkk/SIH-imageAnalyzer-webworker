import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  pubDate: { type: Date, required: true },
});

const NewsSummarizedSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  link: { type: String, required: true },
  pubDate: { type: Date, required: true },
});

const newsSources = new mongoose.Schema({
  name : {type : String, required : true },
  url : {type : String, required : true }
})

export const disasterNewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  source: { type: String, required: true },
  date: { type: String, required: true }, 
  isFetched : {type : Boolean, default : false}
})

export const DisasterNewsStageOne = mongoose.model('DisasterNewsStageOne', disasterNewsSchema);


export const News = mongoose.model("GlobalNews", NewsSchema);
export const SummarizedNews = mongoose.model("SummarizedNews", NewsSummarizedSchema);
export const sources = mongoose.model("newsSources", newsSources);
