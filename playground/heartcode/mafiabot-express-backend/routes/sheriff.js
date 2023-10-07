const express = require('express');
const router = express.Router();
const fs = require('fs');

const gamedataFilePath = require('../gamedataPath');

// Example call:
/*
{
  "playerName": "Player1"
}
*/
//

router.get('/', (req, res) => {
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
    const sheriff = gamedata.players.find(p => p.role === 'SHERIFF' && p.uuid === uuid);

    if (!sheriff) {
      res.status(404).send('Sheriff not found or invalid uuid');
      return;
    }
    // Find the player with the given name
    const player = gamedata.players.find(p => p.username === playerName);

    if (!player) {
      res.status(404).send('Player not found');
      return;
    }

    // Send the role of the player as the response
    res.json({ role: player.role });
  });
});

module.exports = router;

