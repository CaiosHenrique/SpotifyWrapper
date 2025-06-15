const { MongoClient } = require('mongodb');
const mongoClient = new MongoClient('mongodb://localhost:27017');
let db;

async function getDb() {
    if (!db) {
        await mongoClient.connect();
        db = mongoClient.db('spotify_wrapper');
    }
    return db;
}

module.exports = { getDb };