const express = require('express');
const {join} = require("path");
const app = express();


const coreUrl = process.env.BACKEND_URL ?? 'http://localhost:4000'

app.engine('.html', require('ejs').__express);
app.set('views', join(__dirname, 'views'));

const text_outcomes = ["Du tapte! 👎", "Uavgjort 🤝", "Du vant! 👍"]
app.get('/', async (req, res) => {
    const playResp = await fetch(`${coreUrl}/play`)
    const playJson = await playResp.json()
    const playOutcome = playJson.outcome

    const scoreResp = await fetch(`${coreUrl}/score`)
    const scoreJson = await scoreResp.json()
    const score = scoreJson.score

    const highScoreResp = await fetch(`${coreUrl}/high_score`)
    const highScoreJson = await highScoreResp.json()
    const highScore = highScoreJson.high_score

    res.render('game.html', {
        title: "Stein saks papir",
        header: "Some users",
        result: text_outcomes[playOutcome + 1],
        score: score,
        highScore: highScore,
    });
});

module.exports = app;