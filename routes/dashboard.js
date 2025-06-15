const dotenv = require('dotenv');
const { get } = require('http');

dotenv.config();

module.exports = function dashboard(app) {
    app.get('/dashboard', async function(req, res) {
        // Here you can add more functionality, like fetching user data from Spotify

        const token = req.session.access_token;

        await getCurrentlyPlaying(token)
        .then(async data => {
            if (data) {
                console.log('Currently playing:', data.item);

                const artist = data.item.artists;
                
                console.log('Artist:', artist[0].id);
                console.log('token:', token);
                const artistResponse = await getArtistInformation(token, artist[0].id);
                console.log('Artist information:', artistResponse);

                res.render('dashboard', { item: data.item });   
            }
        });
        
        async function getCurrentlyPlaying(token) {
            const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.status === 401) {
                // Redireciona para a home se não autorizado
                res.redirect('/');
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
    });
};