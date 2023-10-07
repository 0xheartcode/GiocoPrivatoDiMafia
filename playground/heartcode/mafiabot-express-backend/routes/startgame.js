const express = require('express');
const router = express.Router();
const fs = require('fs');

// Importing the gamedataPath
const gamedataFilePath = require('../gamedataPath');

// Example call:
/*
{
  "players": ["Player1", "Player2", "Player3", "Player4", "Player5", "Player6"]
}
*/
//
module.exports = () => {
  router.post('/', (req, res) => {
    const { players } = req.body;

        // Check if the request body is empty or does not contain the required data
    if (!players || !Array.isArray(players) || players.length !== 6) {
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

      // Reset the players array
      gamedata.players = [];

      // Assign roles randomly to the players
      const roles = ['Mafia', 'Sheriff', 'Townspeople', 'Townspeople', 'Townspeople', 'Townspeople'];
      players.forEach(player => {
        const randomIndex = Math.floor(Math.random() * roles.length);
        const role = roles.splice(randomIndex, 1)[0];
        gamedata.players.push({
          username: player,
          role,
          alive: true,
          winner: false,
        });
      });

      // Write the updated gamedata back to the JSON file
      fs.writeFile(gamedataFilePath, JSON.stringify(gamedata, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
          return;
        }

        res.json({ message: 'Game started successfully', gameID: gamedata.gameID, players: gamedata.players });
      });
    });
  });

  return router;
};

