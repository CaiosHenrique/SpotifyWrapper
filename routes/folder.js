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
    
    const playlist = await createPlaylist(token, req);

    const genre = req.body.genre;

    const db = await getDb();
    const collection = db.collection(genre);
    const songs = await collection.find({}).toArray();

    await Promise.all(
      songs
        .filter(song => song.id)
        .map(song => postTrackToPlaylist(token, playlist.id, song.id))
    );

    res.redirect(`/collection/${encodeURIComponent(genre.toLowerCase())}`);
  });

  async function postTrackToPlaylist(token, playlistId, trackId) {
    const track = await getTrack(token, trackId);
    console.log('Adding track to playlist:', track.name);

    if (!track) {
      console.error('Track not found:', trackId);
      throw new Error('Track not found');
    }

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: [track.uri]
      })
    });

    if (!response.ok) {
      console.error('Failed to add track to playlist:', response.statusText, response.status);
      throw new Error('Failed to add track to playlist');
    }

    return await response.json();

  }

  async function createPlaylist(token, req) {
    const user = await getCurrentUser(token, req);
    const userId = req.session.userId || user.id;
    const genre = req.body.genre;

    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: "Spotify Wrapper Playlist" + (genre ? ` - ${genre}` : ''),
        description: "A playlist created by Spotify Wrapper",
        public: false
      })
    });

    if (!response.ok) {
      console.error('Failed to create playlist:', response.statusText, response.status);
      throw new Error('Failed to create playlist');
    }

    return await response.json();
  }

  async function getCurrentUser(token, req) {
    if (!token) {
      throw new Error('Access token is required to fetch user data');
    }

    const response = await fetch(`https://api.spotify.com/v1/me`, {
      method: 'GET',
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

  async function getTrack(token, trackId) {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch track');
    }
    return await response.json();
  }
};