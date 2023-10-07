const express = require('express');
const router = express.Router();
const fs = require('fs');

// Importing the gamedataPath
const gamedataFilePath = require('../gamedataPath');
// Example call:
/*
{
  "playerName": "Player2"
}
*/
//

module.exports = () => {
  router.post('/', (req, res) => {
    const { playerName } = req.body;
    const { uuid } = req.body;

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
        res.status(400).json({ error: 'Game is not in progress' });
        return;
      }

      // Validate input: Check if playerName is a non-empty string
      if (!playerName || typeof playerName !== 'string' || playerName.trim() === '') {
        res.status(400).json({ error: 'Invalid input for playerName' });
        return;
      }
    // Validate input: Check if uuid is a non-empty string
    if (!uuid || typeof uuid !== 'string' || uuid.trim() === '') {
      res.status(400).json({ error: 'Invalid input for uuid' });
      return;
    }

    // Find the sheriff in the game
    const mafia = gamedata.players.find(p => p.role === 'MAFIA' && p.uuid === uuid);

    if (!mafia) {
      res.status(404).send('Mafia not found or invalid uuid');
      return;
    }

      // Find the player with the given name
      const playerIndex = gamedata.players.findIndex(p => p.username === playerName);

      if (playerIndex === -1) {
        res.status(404).send('Player not found');
        return;
      }

      // Check if the player is alive
      if (!gamedata.players[playerIndex].alive) {
        res.status(400).send('Player is already dead');
        return;
      }

      // Mark the player as not alive
      gamedata.players[playerIndex].alive = false;

      // Write the updated gamedata back to the JSON file
      fs.writeFile(gamedataFilePath, JSON.stringify(gamedata, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
          return;
        }

        res.json({ message: 'Player killed successfully', killedPlayerName: playerName });
      });
    });
  });

  return router;
};

