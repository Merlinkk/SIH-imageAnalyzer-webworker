import { connectDB } from "./connection/dbConnection.js";
import fetchAllPosts from "./scripts/fetchAllPosts.js";
import analyzePosts from "./scripts/analyzer.js";
import { updateDatabase, setIO } from './postService/dataPoster.js';
import { initializeSocketIO } from './socket/socketConfig.js';

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";

const app = new Hono();

// CORS configuration
app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
  })
);

// JSON parsing middleware
app.use("*", async (c, next) => {
  try {
    c.req.body = await c.req.json();
  } catch {
    c.req.body = {};
  }
  await next();
});

// Register stats route
// app.route('/stats', statsRoute);

/**
 * Fetches posts, processes them, and updates the database.
 */
async function main() {
  try {
    const posts = await fetchAllPosts(); // Await the data before returning
    const data = await analyzePosts(posts); // Await the analyzePosts function

    // console.log(data);

    // await updateDatabase(filteredData);
  } catch (error) {
    console.error("Error in fetching posts:", error);
  }
}

/**
 * Starts the server and initializes necessary components.
 */
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

    // Perform initial data fetch and update
    await main();

    // Set up periodic updates every 15 seconds
    // setInterval(main, 15000);
  } catch (error) {
    console.error("Error in starting server:", error);
    process.exit(1); // Exit process on failure
  }
}

// Start the server
startServer().catch(console.error);

export default app;
