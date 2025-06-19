const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

module.exports = function homePage(app) {
    app.get('/', function(req, res) {
        console.log('Home page request received');
        res.sendFile(path.join(__dirname, '../views/home.html'));
    });
}