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