import { connectDB, unfilteredPostsCollection } from "./connection/dbConnection.js";
import fetchAllPosts from "./scripts/fetchAllPosts.js";
import analyzePosts from "./scripts/analyzer.js";
import { setIO } from './postService/dataPoster.js';
import { initializeSocketIO } from './socket/socketConfig.js';

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
  })
);

app.use("*", async (c, next) => {
  try {
    c.req.body = await c.req.json();
  } catch {
    c.req.body = {};
  }
  await next();
});

async function processPosts() {
  try {
    const posts = await fetchAllPosts();
    console.log(posts);

    if (posts.length > 0) {

      const successfulPostIds = posts.map(
        (post) => post.originalPost
      );

      const result = await unfilteredPostsCollection.updateMany(
        { _id: { $in: successfulPostIds } },
        { $set: { filtered: true } }
      );

      console.log(`Marked ${result.modifiedCount} posts as filtered.`);
      
      await analyzePosts(posts);
    } else {
      console.log("No posts were successfully transformed.");
    }
  } catch (error) {
    console.error("Error in processing posts:", error);
  }
}

async function runMain(interval = 15000) {
  let iteration = 0;
  while (true) {
    try {
      console.log(`Iteration: ${++iteration}`);
      await processPosts();
      await new Promise((resolve) => setTimeout(resolve, interval));
    } catch (error) {
      console.error("Error in runMain loop:", error);
    }
  }
}

async function startServer() {
  const PORT = process.env.PORT || 3000;

  try {
    // Connect to the database
    await connectDB();

    // Initialize server
    const server = serve({
      fetch: app.fetch,
      port: PORT,
    });

    // Initialize Socket.IO
    const io = initializeSocketIO(server);
    setIO(io);

    console.log(`Server is running on port ${PORT}`);

    // Start the recurring task
    runMain().catch(console.error);
  } catch (error) {
    console.error("Error in starting server:", error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(console.error);

export default app;
