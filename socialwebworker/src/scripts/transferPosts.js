import { SMDB, rawDB } from '../connection/dbConnection'

export default async function transferPosts() {
    let allPosts = [];
    try {
        // Fetch data from SMDB
        const smdb = SMDB.db();
        const smdbCollection = smdb.collection('unfilteredposts');
        allPosts = await smdbCollection.find().toArray();

        console.log(allPosts);

        // Insert data into rawDB
        if (allPosts.length > 0) {
            const rawdb = rawDB.db();
            const rawdbCollection = rawdb.collection('raw_data');

            // Insert the posts into rawDB
            await rawdbCollection.insertMany(allPosts);
            console.log('Data successfully transferred to rawDB.');
        } else {
            console.log('No posts found to transfer.');
        }
        return 'Data successfully transferred to rawDB.';
    } catch (error) {
        console.error('Error during the data transfer:', error);
        return error;
    }
}
