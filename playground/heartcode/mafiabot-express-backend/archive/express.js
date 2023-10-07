const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware to parse JSON in request body
app.use(express.json());

const gamedataFilePath = 'gamedata.json';

// Endpoint for the Sheriff to ask for the role of a specific player
app.get('/sheriff', (req, res) => {
  const { playerName } = req.body;

  // Read the contents of the gamedata.json file
  fs.readFile(gamedataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Parse the JSON data
    const gamedata = JSON.parse(data);

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

// Endpoint for the Mafia to "kill" a specific player
app.post('/mafia', (req, res) => {
  const { playerName } = req.body;

  // Read the contents of the gamedata.json file
  fs.readFile(gamedataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Parse the JSON data
    const gamedata = JSON.parse(data);

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

// Endpoint to get the list of winners from the JSON file
app.get('/getwinners', (req, res) => {
  // Read the contents of the gamedata.json file
  fs.readFile(gamedataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Parse the JSON data
    const gamedata = JSON.parse(data);

    // Filter players to get the list of winners
    const winners = gamedata.players.filter(player => player.winner);

    // Send the list of winners as the response
    res.json(winners);
  });
});

// Endpoint for townspeople to vote
app.post('/vote', (req, res) => {
  const votes = req.body.votes;

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
      fs.writeFile(gamedataFilePath, JSON.stringify(gamedata, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
          return;
        }

        res.json({ message: 'Player killed successfully', killedPlayerName });
      });
    } else {
      res.json({ message: 'No majority vote or a tie, no death' });
    }
  });
});



app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

