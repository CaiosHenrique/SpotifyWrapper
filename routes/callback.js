module.exports = function callback(app) {
    app.get('/callback', function(req, res) {
        console.log('Callback request received');
        res.send(`
            <h1>Callback Page</h1>
            <p>This is the callback page after Spotify authentication.</p>
            <p><a href="/">Go to Home</a></p>
        `);
    });   
}