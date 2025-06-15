const express = require('express');
const consign = require('consign');

const app = express();

consign()
    .include('routes') // Load middlewares
    .into(app); // Inject into app


module.exports = app;