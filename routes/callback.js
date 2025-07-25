const querystring = require('querystring');
const dotenv = require('dotenv');
const { get } = require('http');
const { access } = require('fs');

dotenv.config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

module.exports = function callback(app) {
    app.get('/callback', async function(req, res) {
        console.log('Callback request received');

        var code = req.query.code || null;
        var state = req.query.state || null;

        if (state === null) {
            res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
        } else {
            await getAccessToken(code);
        }

        async function getAccessToken(code) {
            var tokenRequest = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                    code: code,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code'
                },
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + (new Buffer.from(clientId + ':' + clientSecret).toString('base64'))
                }
            };

            const response = await fetch(tokenRequest.url, {
                method: 'POST',
                headers: tokenRequest.headers,
                body: querystring.stringify(tokenRequest.form)
            });

            if (response.status === 401) {
                // Token inválido, redireciona para home
                return res.redirect('/');
            }

            const data = await response.json();

            if (data.error) {
                return res.redirect('/');
            }

            req.session.access_token = data.access_token;
            if (data.refresh_token) {
                req.session.refresh_token = data.refresh_token;
            }

            return res.redirect('/dashboard');
        }
    });   
}