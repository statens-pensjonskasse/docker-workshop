const express = require('express');
const app = express();

const backendUrl = process.env.BACKEND_URL ?? 'http://127.0.0.1:8080'

app.get('/play', async (req, res) => {
    const resp = await fetch(`${backendUrl}/play`)
    const json = await resp.json()
    res.send(json)
});

app.get('/score', async (req, res) => {
    const resp = await fetch(`${backendUrl}/score`)
    const json = await resp.json()
    res.send(json)
});

app.get('/high_score', async (req, res) => {
    const resp = await fetch(`${backendUrl}/high_score`)
    const json = await resp.json()
    res.send(json)
});

module.exports = app;