import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { connectDB } from './connection/dbConnection'

import transferPosts from './scripts/transferPosts'

const app = new Hono()

await connectDB;

app.get('/', async(c) => {

  const res = await transferPosts();

  return c.text(res);
})



const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
