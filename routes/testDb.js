const {getDb} = require('../config/dbConnection');

module.exports = function testDb(app) {
    app.get('/test-db', async function(req, res) {
        try {
            console.log('Testing MongoDB connection...');
            const db = await getDb();
            
            // Testa se consegue listar as coleções
            const collections = await db.listCollections().toArray();
            console.log('Collections found:', collections.map(c => c.name));
            
            res.json({
                status: 'success',
                message: 'MongoDB connection working!',
                database: db.databaseName,
                collections: collections.map(c => c.name)
            });
        } catch (error) {
            console.error('MongoDB connection error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    });
}
