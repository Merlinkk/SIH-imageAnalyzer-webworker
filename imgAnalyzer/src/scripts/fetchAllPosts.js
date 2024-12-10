import { unfilteredPostsCollection } from "../connection/dbConnection.js";

export default async function fetchAllPosts() {
  let allPosts = [];
  try {
    allPosts = await unfilteredPostsCollection
      .find({
        filtered: false,
        "post.imageUrl": { $ne: null },
      })
      .toArray();
  } catch (error) {
    console.error("Error updating and fetching data from MongoDB:", error);
  }

  return allPosts;
}