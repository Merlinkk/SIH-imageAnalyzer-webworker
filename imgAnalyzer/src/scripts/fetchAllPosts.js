import { sahyogdb_Dev } from './../connection/dbConnection'


export default async function fetchAllPosts() {
    let allPosts = [];
    try {
      const db = sahyogdb_Dev.db();
      const collection = db.collection('unfilteredposts');
  
      allPosts = await collection.find().toArray();
      // console.log('All available posts:', allPosts);
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
    }
    return allPosts;
  }