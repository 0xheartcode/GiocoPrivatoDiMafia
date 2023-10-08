const express = require('express');
const router = express.Router();
const fs = require('fs');

// Importing the gamedataPath
const {gameDataFilePath} = require('../db/dbPaths');
const countAlivePlayers = require('./countaliveplayers');
const endgameRoute = require('./endgame');

module.exports = () => {
  // Example call:
  // POST /mafia/killplayer
  router.post('/', (req, res) => {
    const { playerName, uuid } = req.body;

    // Read the contents of the gamedata.json file
    fs.readFile(gameDataFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Parse the JSON data
      const gamedata = JSON.parse(data);

      // Check if the game is in progress
      if (!gamedata.partyInProgress) {
        res.status(400).json({ error: 'Game is not in progress' });
        return;
      }

      // Validate input: Check if playerName and uuid are non-empty strings
      if (!playerName || typeof playerName !== 'string' || playerName.trim() === '' ||
          !uuid || typeof uuid !== 'string' || uuid.trim() === '') {
        res.status(400).json({ error: 'Invalid input for playerName or uuid' });
        return;
      }

      // Find the mafia in the game
      const mafia = gamedata.players.find(p => p.role === 'MAFIA' && p.uuid === uuid);

      if (!mafia) {
        res.status(404).send('Mafia not found or invalid uuid');
        return;
      }

      // Find the player with the given name
      const playerIndex = gamedata.players.findIndex(p => p.username === playerName);

      if (playerIndex === -1) {
        // Set the night to false
        gamedata.night = false;
        // Write the updated gamedata back to the JSON file
        fs.writeFile(gameDataFilePath, JSON.stringify(gamedata, null, 2), 'utf8', (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
          }
          res.status(404).send('Player not found');
        });
        return;
      }

      // Check if the player is alive
      if (!gamedata.players[playerIndex].alive) {
        // Set the night to false
        gamedata.night = false;
        // Write the updated gamedata back to the JSON file
        fs.writeFile(gameDataFilePath, JSON.stringify(gamedata, null, 2), 'utf8', (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
          }
          res.status(400).send('Player is already dead');
        });
        return;
      }

      // Mark the player as not alive
      gamedata.players[playerIndex].alive = false;

      // Set the night to false
      gamedata.night = false;

      // Write the updated gamedata back to the JSON file
      fs.writeFile(gameDataFilePath, JSON.stringify(gamedata, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
          return;
        }

        // Check the number of alive players after killing
        const alivePlayersCount = countAlivePlayers(gamedata);

        // Check if there are only 2 players alive
        if (alivePlayersCount === 2) {
          // Call the endgame function
          endgameRoute(req, res);
        } else {
          res.json({ message: 'Player killed successfully', killedPlayerName: playerName });
        }
      });
    });
  });

  // ... (other routes and exports)

  return router;
};

