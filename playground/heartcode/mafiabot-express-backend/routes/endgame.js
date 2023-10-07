const express = require('express');
const router = express.Router();
const fs = require('fs');

// Importing the gamedataPath
const gamedataFilePath = require('../gamedataPath');

// Function to handle ending the game
function endgameRoute(req, res) {
  // Read the contents of the gamedata.json file
  fs.readFile(gamedataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Parse the JSON data
    const gamedata = JSON.parse(data);

    // Check if the game is in progress
    if (!gamedata.partyInProgress) {
      res.status(400).send('Game is not in progress');
      return;
    }

    // Get an array of all players who are alive
    const alivePlayers = gamedata.players.filter(player => player.alive);

    // Set those players as winners
    alivePlayers.forEach(player => {
      player.winner = true;
    });

    // Set partyInProgress to false
    gamedata.partyInProgress = false;

    // Write the updated gamedata back to the JSON file
    fs.writeFile(gamedataFilePath, JSON.stringify(gamedata, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
        return;
      }

      res.json({ message: 'Game ended successfully', winners: alivePlayers.map(player => player.username) });
    });
  });
}

// Example call:
// POST /endgame
//router.post('/', endGame);

module.exports = endgameRoute;



