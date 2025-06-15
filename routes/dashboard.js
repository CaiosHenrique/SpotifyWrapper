const dotenv = require('dotenv');
const { get } = require('http');

dotenv.config();

module.exports = function dashboard(app) {
    app.get('/dashboard', async function(req, res) {
        // Here you can add more functionality, like fetching user data from Spotify

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

            return res.render('dashboard', { item: data.item, artist: artist});
        } else {
            return res.redirect('/');
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