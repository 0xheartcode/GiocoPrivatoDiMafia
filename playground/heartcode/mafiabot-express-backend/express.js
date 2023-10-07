const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware to parse JSON in request body
app.use(express.json());

const gamedataFilePath = 'gamedata.json';

// Importing route handlers from other files
const startgameRoute = require('./routes/startgame')();
const sheriffRoute = require('./routes/sheriff');
const mafiaRoute = require('./routes/mafia')();
const voteRoute = require('./routes/vote')();
const endgameRoute = require('./routes/endgame')();

const eventsRoute = require('./routes/events');
const playerReadyRoute = require('./routes/playerreadyroute');

// Using the route handlers
app.use('/startgame', startgameRoute);
app.use('/sheriff', sheriffRoute);
app.use('/mafia', mafiaRoute);
app.use('/vote', voteRoute);
app.use('/endgame', endgameRoute);

// Using the events route
app.use('/events', eventsRoute);
app.use('/playerready', playerReadyRoute);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

