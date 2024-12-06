import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { connectDB } from './connection/dbConnection.js';
import fetchAllPosts from "./scripts/fetchAllPosts.js"
import analyzePosts from "./scripts/analyzer.js"
const app = new Hono();

await connectDB(); // Ensure database connection is established before handling requests



app.get('/', async (c) => {
  const posts = await fetchAllPosts(); // Await the data before returning
  const data = await analyzePosts(posts); // Await the analyzePosts function
  return c.text(data); // Send the analysis result as plain text
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
