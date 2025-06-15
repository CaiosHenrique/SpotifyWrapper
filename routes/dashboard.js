const dotenv = require('dotenv');
const { get } = require('http');
const {getDb} = require('../config/dbConnection');

dotenv.config();

module.exports = function dashboard(app) {
    app.get('/dashboard', async function(req, res) {
        const token = req.session.access_token;
        let data = await getCurrentlyPlaying(token);

        if (!data && req.session.refresh_token) {
            await refreshAccessToken();
            token = req.session.access_token;
            data = await getCurrentlyPlaying(token);
        }

        const db = await getDb();
        const collections = await db.listCollections().toArray();
        
        const allGenres = collections
            .map(col => col.name)
            .filter(name => name !== 'musicas' && !name.startsWith('system.'));

        const page = parseInt(req.query.page) || 1;
        const perPage = 9;
        const totalPages = Math.ceil(allGenres.length / perPage);

        if (data) {
            const mainArtist = data.item.artists;
            const artist = await getArtistInformation(token, mainArtist[0].id);

            return res.render('dashboard', { 
                item: data.item, 
                artist: artist, 
                allGenres,
                page,
                totalPages
            });
        } else {
            return res.render('dashboard', { 
                item: null, 
                artist: {}, 
                allGenres,
                page,
                totalPages
            });
        }
    });
    
    app.get('/api/currently-playing', async function(req, res) {
        const token = req.session.access_token;
        let data = await getCurrentlyPlaying(token);

        if (!data && req.session.refresh_token) {
            await refreshAccessToken();
            token = req.session.access_token;
            data = await getCurrentlyPlaying(token);
        }

        if (data) {
            const mainArtist = data.item.artists;
            const artist = await getArtistInformation(token, mainArtist[0].id);
            const db = await getDb();

            const musicasCollection = db.collection('musicas');
            const musicaExistenteGeral = await musicasCollection.findOne({
                title: data.item.name,
                artist: mainArtist[0].name
            });
            if (!musicaExistenteGeral) {
                await musicasCollection.insertOne({
                    title: data.item.name,
                    artist: mainArtist[0].name,
                    genres: artist.genres,
                    image: data.item.album.images[0]?.url
                });
            }

            for (const genre of artist.genres) {
                const collection = db.collection(genre);
                const musicaExistente = await collection.findOne({
                    title: data.item.name,
                    artist: mainArtist[0].name
            });
            if (!musicaExistente) {
                await collection.insertOne({
                    title: data.item.name,
                    artist: mainArtist[0].name,
                    genres: artist.genres,
                    image: data.item.album.images[0]?.url
                });
                } else {
                    console.log('Música já existe no banco de dados');
                }
            }
            res.json({ item: data.item, artist });
        } else {
            res.json({ item: null });
        }
    });

     async function getCurrentlyPlaying(token) {
            const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.status === 401) {
                return null;
            }

            if (!response.ok) {
                throw new Error(`Spotify API error: ${response.status}`);
            }

            const data = await response.json();
            return data;
        }

        async function getArtistInformation(token, artistId) {
            const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
                headers: {
                    'authorization': `Bearer ${token}`,
                }
            });
            return response.json();
        };

        async function refreshAccessToken() {
            console.log('Refreshing access token...');
            const refreshToken = req.session.refresh_token;
            const url = "https://accounts.spotify.com/api/token";

            const payload = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: process.env.SPOTIFY_CLIENT_ID
                }),
            };
            const body = await fetch(url, payload);
            const response = await body.json();

            req.session.access_token = response.access_token;
            if (response.refresh_token) {
                req.session.refresh_token = response.refresh_token;
            }
        }
};