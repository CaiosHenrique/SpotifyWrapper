const dotenv = require('dotenv');

dotenv.config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

module.exports = function homePage(app) {
    app.get('/', function(req, res) {
        console.log('Home page request received');
        res.send(`
            <h1>Welcome to the Spotify API Example</h1>
            <p><a href="/login">Login with Spotify</a></p>
        `);
    });
}


// const token = await getToken(clientId, clientSecret);
// console.log('Token:', token);

// if (!token) {
//     throw new Error('Failed to retrieve Spotify access token');
// } else {
//     console.log('Spotify access token retrieved successfully');
//     getCurrentlyPlaying(token)
// }

// async function getToken(clientId, clientSecret) {
//     const response = await fetch('https://accounts.spotify.com/api/token', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
//         },
//         body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
//     });

//     if (!response.ok) {
//         throw new Error(`Spotify Auth error: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.access_token;
// }

// async function getCurrentlyPlaying(token) {
//     const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
//         headers: {
//             'Authorization': `Bearer ${token}`,
//         }
//     });

//     if (!response.ok) {
//         throw new Error(`Spotify API error: ${response.status}`);
//     }

//     const data = await response.json();
//     return data;
// }

// Exemplo de uso:
// const token = 'SEU_TOKEN_DE_ACESSO_AQUI';
// getCurrentlyPlaying(token).then(console.log).catch(console.error);