const { use } = require('react');
const { getDb } = require('../config/dbConnection');
const { response } = require('../config/server');

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

  app.post('/create/playlist', async (req, res) => {
    const token = req.session.access_token;
    const playlist = createPlaylist(token)

    res.send({
      success: true,
      message: 'Playlist created successfully',
      playlist
    });
  });

  async function createPlaylist(token) {
    const userId = await getCurrentUser(token);
    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: "Spotify Wrapper Playlist",
        public: false
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create playlist');
    }

    return await response.json();
  }

  async function getCurrentUser(token) {
    const response = fetch(`https://api.spotify.com/v1/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const data = await response.json();
    req.session.userId = data.id;
    return data;
  }
};