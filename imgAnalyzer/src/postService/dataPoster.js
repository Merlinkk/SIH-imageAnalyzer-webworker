import { disasterPostsCollection } from "../connection/dbConnection.js";
import { embeddings } from "../llm/Embeddings.js";
import { vectorStore } from "../llm/MongoDbVectoreStore.js";

let io;

const setIO = (socketIO) => {
  io = socketIO;
};

async function updateDatabase(post) {

      try {
        const { city, state, country } = post.transformedPost.location || {};
        const locationString = [city, state, country]
          .filter(Boolean)
          .join(", ");
        console.log(post.transformedPost.description);

        const combinedText = `${locationString} ${post.transformedPost.type} ${post.transformedPost.description}`;

        const postEmbedding = await embeddings.embedDocuments([combinedText]);

        const searchResults = await vectorStore.similaritySearchWithScore(
          combinedText,
          3 // Increase search results to get more context
        );

        console.log("Search results:", searchResults);

        const similarityThreshold = 0.9;
        const similarDocument = searchResults.find(
          (result) => result[1] > similarityThreshold
        );

        if (similarDocument && similarDocument[0]?.metadata?._id) {
          const documentId = similarDocument[0].metadata._id;
          console.log(`Found similar document with ID: ${documentId} \n`);
          console.log(similarDocument);

          const query = { _id: documentId };
          const update = {
            $inc: { numberOfPosts: 1 },
            $push: { posts: post.originalPost },
          };

          await disasterPostsCollection.updateOne(query, update);
          console.log(
            `Incremented numberOfPosts and updated "posts" array for post ID: ${documentId} \n`
          );
        } else {
          console.log("No similar document found, inserting a new post. \n");
          const newPost = {
            ...post.transformedPost,
            embedding: postEmbedding,
            numberOfPosts: 1,
            posts: [post.originalPost],
            timestamp : post.timestamp
          };

          console.log("\n\n\n\n",newPost,"\n\n\n");

          const insertResult = await disasterPostsCollection.insertOne(newPost);
          console.log(`Inserted new post with ID: ${insertResult.insertedId}`);

          if (io) {
            const { embedding, ...postWithoutEmbedding } = newPost;
            io.emit("newEntry", postWithoutEmbedding);
            console.log(
              "Emitted 'newEntry' event with new post excluding embedding. \n"
            );
          }
        }
      } catch (err) {
        console.error("Error processing post:", post, err);
      }
    

    console.log(
      "Database updated with filtered disaster posts and embeddings. \n"
    );
 
}

export { updateDatabase, setIO };