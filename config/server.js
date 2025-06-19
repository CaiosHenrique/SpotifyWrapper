const express = require('express');
const session = require('express-session');
const consign = require('consign');
const dotenv = require('dotenv');

dotenv.config(); 

const app = express();
app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('styles'));
app.use(express.static('images'));

app.use(session({
    secret:  process.env.SESSION_SECRET || null,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

consign()
    .include('routes')
    .into(app);


module.exports = app;