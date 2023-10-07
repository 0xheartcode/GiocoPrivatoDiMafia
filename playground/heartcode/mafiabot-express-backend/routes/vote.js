const express = require('express');
const router = express.Router();
const fs = require('fs');

// Importing the gamedataPath
const gamedataFilePath = require('../gamedataPath');


// Example call:
/*
  {
    "votes": [
      { "votedPlayerName": "Player2", "uuid":"uuid-player-1", "voterName": "Player1" },
    ]
  }
*/
//

module.exports = () => {
  router.post('/', (req, res) => {
    
    // Validate input: Check if the request body has the expected structure
    if (!req.body.vote || typeof req.body.vote !== 'object') {
      res.status(400).json({ error: 'Invalid input for vote' });
      return;
    }

    const { voterName, votedPlayerName, uuid } = req.body.vote;

    // Validate input: Check if voterName and uuid are non-empty strings
    if (
      !voterName || typeof voterName !== 'string' || voterName.trim() === '' ||
      !uuid || typeof uuid !== 'string' || uuid.trim() === ''
    ) {
      res.status(400).json({ error: 'Invalid input for voterName or uuid' });
      return;
    }

    // Validate input: Check if the request body has the expected structure
  if (!req.body.votes || !Array.isArray(req.body.votes)) {
    res.status(400).json({ error: 'Invalid input for votes' });
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

      // Check if the game is in progress
      if (!gamedata.partyInProgress) {
        res.status(400).send('Game is not in progress');
        return;
      }
      // Check if it is night
      if (gamedata.night) {
        res.status(400).json({ error: 'Players cannot vote at night' });
        return;
      }

      const voterIndex = gamedata.players.findIndex(p => p.username === voterName && p.uuid === uuid);

// Check if voterName and uuid match
if (voterIndex === -1) {
  res.status(400).json({ error: 'Invalid vote: voterName and uuid do not match' });
  return;
}

// Check if the voter is alive
if (!gamedata.players[voterIndex].alive) {
  res.status(400).json({ error: 'Invalid vote: Voter is not alive' });
  return;
}

// Check if the voter has already voted
if (gamedata.players[voterIndex].voted) {
  res.status(400).json({ error: 'Invalid vote: Voter has already voted' });
  return;
}

// Set voted to true for the voter
gamedata.players[voterIndex].voted = true;


function countAlivePlayers(gamedata) {
  return gamedata.players.filter(player => player.alive).length;
}

function countAlivePlayersWithVotes(gamedata) {
  // Filter players who are alive and have voted
  const alivePlayersWithVotes = gamedata.players.filter(player => player.alive && player.voted);

  // Return the count of alive players with votes
  return alivePlayersWithVotes.length;
}

  
      // Process each vote
      votes.forEach(vote => {
        const { voterName, votedPlayerName } = vote;

        // Find the player who is voting
        const voterIndex = gamedata.players.findIndex(p => p.username === voterName);

        if (voterIndex !== -1 && gamedata.players[voterIndex].alive) {
          // Find the player who is being voted for
          const votedPlayerIndex = gamedata.players.findIndex(p => p.username === votedPlayerName);

          if (votedPlayerIndex !== -1 && gamedata.players[votedPlayerIndex].alive) {
            // Store the vote in the array
            gamedata.votes.push({ voter: voterName, votedPlayer: votedPlayerName });
          }
        }
      });

      // Check for a majority vote
      const voteCounts = {};
      gamedata.votes.forEach(vote => {
        voteCounts[vote.votedPlayer] = (voteCounts[vote.votedPlayer] || 0) + 1;
      });

      const maxVotes = Math.max(...Object.values(voteCounts));
      const majorityPlayers = Object.keys(voteCounts).filter(player => voteCounts[player] === maxVotes);

      // Check for a tie or no majority vote
      if (majorityPlayers.length === 1) {
        // Mark the player as not alive
        const killedPlayerName = majorityPlayers[0];
        const killedPlayerIndex = gamedata.players.findIndex(p => p.username === killedPlayerName);
        gamedata.players[killedPlayerIndex].alive = false;

        // Write the updated gamedata back to the JSON file
        gamedata.night = true;
        fs.writeFile(gamedataFilePath, JSON.stringify(gamedata, null, 2), 'utf8', (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
          }
          res.json({ message: 'Player killed successfully', killedPlayerName });
        });
      } else {

        // TODO ==> change date to NIGHT true, and write to database.
        
        res.json({ message: 'No majority vote or a tie, no death' });
      }
    });
  });

  return router;
};

