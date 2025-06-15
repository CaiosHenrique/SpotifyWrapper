module.exports = function logout(app) {
    app.get('/logout', function(req, res) {

        req.session.destroy(function(err) {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.redirect('/');
        });
    });
}