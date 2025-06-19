const { getDb } = require('../config/dbConnection');

module.exports = function folder(app) {
  app.get('/collection/:genre', async (req, res) => {
    let genre = req.params.genre;
    genre = genre.trim().toLowerCase();

    const db = await getDb();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    if (!collectionNames.includes(genre)) {
      return res.render('folder', {
        genre,
        songs: [],
        favoriteArtist: null
      });
    }

    const collection = db.collection(genre);
    let songs = await collection.find({}).toArray();

    songs.sort((a, b) => a.artist.localeCompare(b.artist));

    const artistCount = {};
    songs.forEach(song => {
      artistCount[song.artist] = (artistCount[song.artist] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(artistCount), 0);
    const favoriteArtists = Object.entries(artistCount)
      .filter(([artist, count]) => count === maxCount)
      .map(([artist]) => artist);

    res.render('folder', {
      genre,
      songs,
      favoriteArtist: favoriteArtists.length > 0 ? favoriteArtists : null
    });
  });

  app.get('/find/collection', (req, res) => {
    const genre = req.query.genre;
    if (!genre) {
      return res.redirect('/dashboard');
    }
    res.redirect(`/collection/${encodeURIComponent(genre.toLowerCase())}`);
  });
};