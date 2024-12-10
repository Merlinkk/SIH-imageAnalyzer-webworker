import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { embeddings } from "./Embeddings.js";
import { clientReport } from "../connection/dbConnection.js";

const dbConfig = {
  collection: clientReport.db().collection("disasterPosts"),
  indexName: "vector_index",
  textKey: "embedding_text",
  embeddingKey: "embedding",
};

export const vectorStore = new MongoDBAtlasVectorSearch(embeddings, dbConfig);
