const { getDb } = require('../config/dbConnection');

module.exports = function folder(app) {
  app.get('/collection/:genre', async (req, res) => {
    console.log('1')
  let genre = req.params.genre;
  genre = genre.trim().toLowerCase();

  const db = await getDb();
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(col => col.name);

  if (!collectionNames.includes(genre)) {
    return res.render('folder', {
      genre,
      songs: []
    });
  }

  const collection = db.collection(genre);
  const songs = await collection.find({}).toArray();

  res.render('folder', {
    genre,
    songs
  });
});

  app.get('/find/collection', (req, res) => {
    const genre = req.query.genre;
    console.log(`Searching for genre: ${genre}`);
    if (!genre) {
      return res.redirect('/dashboard');
    }
    res.redirect(`/collection/${encodeURIComponent(genre.toLowerCase())}`);
  });
};