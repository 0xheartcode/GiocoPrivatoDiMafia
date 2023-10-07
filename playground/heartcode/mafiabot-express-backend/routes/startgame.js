// startgame.js

const express = require('express');
const router = express.Router();
const fs = require('fs');

// Importing the gamedataPath
const gamedataFilePath = require('../gamedataPath');

function startgameRoute(playerData) {
  return (req, res) => {
    console.log("Hello world. Startgame has started");

    // Check if the request body is empty or does not contain the required data
    if (!playerData || !Array.isArray(playerData) || playerData.length !== 6) {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    // Read the contents of the gamedata.json file
    fs.readFile(gamedataFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Parse the JSON data
      const gamedata = JSON.parse(data);

      // Increment the gameID
      gamedata.gameID++;

      // Set partyInProgress to true
      gamedata.partyInProgress = true;
      gamedata.night = false;
      // Reset the players array
      gamedata.players = [];

      // Assign roles randomly to the players
      const roles = ['MAFIA', 'SHERIFF', 'TOWNSPEOPLE', 'TOWNSPEOPLE', 'TOWNSPEOPLE', 'TOWNSPEOPLE'];
      playerData.forEach(player => {
        const randomIndex = Math.floor(Math.random() * roles.length);
        const role = roles.splice(randomIndex, 1)[0];
        // Add the uuid directly to the player object
        gamedata.players.push({
          username: player.playerName,
          uuid: player.uuid,
          role,
          alive: true,
          winner: false,
          voted: false,
        });
      });

      // Write the updated gamedata back to the JSON file
      fs.writeFile(gamedataFilePath, JSON.stringify(gamedata) + '\n', 'utf8', (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
          return;
        }

        res.json({ message: 'Game started successfully', gameID: gamedata.gameID, players: gamedata.players });
      });
    });
  };
}

module.exports = startgameRoute;

