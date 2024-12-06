import { sahyog } from './../connection/dbConnection'


export default async function fetchAllPosts() {
    let allPosts = [];
    try {
      const db = sahyog.db();
      const collection = db.collection('raw_data');
  
      allPosts = await collection.find().toArray();
      // console.log('All available posts:', allPosts);
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
    }
    return allPosts;
  }