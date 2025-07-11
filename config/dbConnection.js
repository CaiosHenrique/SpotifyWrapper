const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const mongoClient = new MongoClient(mongoUri);
let db;

async function getDb() {
    if (!db) {
        await mongoClient.connect();
        console.log('Connected to MongoDB successfully');
        
        // Extrai o nome do banco da URI ou usa o padrão
        let dbName = 'spotify_wrapper'; // padrão
        
        if (mongoUri.includes('/') && !mongoUri.endsWith('/')) {
            const uriParts = mongoUri.split('/');
            const lastPart = uriParts[uriParts.length - 1];
            const dbNameFromUri = lastPart.split('?')[0]; // remove query parameters
            if (dbNameFromUri && dbNameFromUri.length > 0) {
                dbName = dbNameFromUri;
            }
        }
        
        console.log(`Using database: ${dbName}`);
        db = mongoClient.db(dbName);
    }
    return db;
}

module.exports = { getDb };