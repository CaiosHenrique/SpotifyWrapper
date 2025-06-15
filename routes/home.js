const dotenv = require('dotenv');

dotenv.config();

module.exports = function homePage(app) {
    app.get('/', function(req, res) {
        console.log('Home page request received');
        res.send(`
            <h1>Welcome to the Spotify API Example</h1>
            <p><a href="/login">Login with Spotify</a></p>
        `);
    });
}