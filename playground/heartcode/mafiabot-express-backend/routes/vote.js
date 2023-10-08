const express = require("express");
const router = express.Router();
const fs = require("fs");

// Importing the gamedataPath
const { gameDataFilePath } = require("../db/dbPaths");

// Example call:
/*
 * 
 {
"vote": {  "voterName": "JohnDoe", "votedPlayerName": "", "uuid":"b02319cc-ba1f-44f9-b372-6e29c3fcd4e5"}
}
*/

module.exports = () => {
  router.post("/", (req, res) => {
    // Validate input: Check if the request body has the expected structure
    if (!req.body.vote || typeof req.body.vote !== "object") {
      res.status(400).json({ error: "Invalid input for vote" });
      return;
    }

    const { voterName, votedPlayerName, uuid } = req.body.vote;
    // Check if voterName is a non-empty string
    if (!voterName || typeof voterName !== "string" || voterName.trim() === "") {
      res.status(400).json({ error: "Invalid input for voterName" });
      return;
    }

    // Check if votedPlayerName is a non-empty string
    if (!votedPlayerName || typeof votedPlayerName !== "string" || votedPlayerName.trim() === "") {
      res.status(400).json({ error: "Invalid input for votedPlayerName" });
      return;
    }

    // Check if uuid is a non-empty string
    if (!uuid || typeof uuid !== "string" || uuid.trim() === "") {
      res.status(400).json({ error: "Invalid input for uuid" });
      return;
    }

    // Read the contents of the gamedata.json file
    fs.readFile(gameDataFilePath, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
        return;
      }

      // Parse the JSON data
      const gamedata = JSON.parse(data);

      // Check if the game is in progress
      if (!gamedata.partyInProgress) {
        res.status(400).send("Game is not in progress");
        return;
      }
      // Check if it is night
      if (gamedata.night) {
        res.status(400).json({ error: "Players cannot vote at night" });
        return;
      }

      const voterIndex = gamedata.players.findIndex(p => p.username === voterName && p.uuid === uuid);
  /*    // Check if voterName and uuid match
      if (voterIndex === -1) {
        res.status(400).json({ error: "Invalid vote: voterName and uuid do not match" });
        return;
      }*/

      // Check if the voter is alive
      if (!gamedata.players[voterIndex].alive) {
        res.status(400).json({ error: "Invalid vote: Voter is not alive" });
        return;
      }

      // Check if the voter has already voted
      if (gamedata.players[voterIndex].voted) {
        res.status(400).json({ error: "Invalid vote: Voter has already voted" });
        return;
      }

      // Check if votedPlayerName is part of the alive players
      const votedPlayerIndex = gamedata.players.findIndex(p => p.username === votedPlayerName);

      if (votedPlayerIndex === -1 || !gamedata.players[votedPlayerIndex].alive) {
        res.status(400).json({ error: "Voted player is not part of alive players, or does not exist" });
        return;
      }

      // Set voted and votedFor for the voter
      gamedata.players[voterIndex].votedFor = votedPlayerName;
      gamedata.players[voterIndex].voted = true;
      // Write the updated gamedata back to the JSON file
      fs.writeFile(gameDataFilePath, JSON.stringify(gamedata, null, 2), "utf8", (err) => {
        if (err) {
          console.error(err);
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
        fs.writeFile(gameDataFilePath, JSON.stringify(gamedata, null, 2), "utf8", (err) => {
          if (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
            return;
          }
        });

        function countAlivePlayers(gamedata) {
          return gamedata.players.filter(player => player.alive).length;
        }

        function countAlivePlayersWithVotes(gamedata) {
          // Filter players who are alive and have voted
          const alivePlayersWithVotes = gamedata.players.filter(player => player.alive && player.voted);

          // Return the count of alive players with votes
          return alivePlayersWithVotes.length;
        }

        function getVotedForCounts(gamedata) {
          const voteCounts = {};

          gamedata.players.forEach(player => {
            if (player.voted) {
              const votedFor = player.votedFor;

              if (votedFor) {
                if (voteCounts[votedFor]) {
                  voteCounts[votedFor]++;
                } else {
                  voteCounts[votedFor] = 1;
                }
              }
            }
          });

          return voteCounts;
        }

        function getTopVotedPlayer(voteCounts) {
          const maxVotes = Math.max(...Object.values(voteCounts));
          const topVotedPlayers = Object.keys(voteCounts).filter(player => voteCounts[player] === maxVotes);
          // If there is a tie, return null
          if (topVotedPlayers.length > 1) {
            return null;
          }

          // Return the top-voted player
          return topVotedPlayers[0];
        }

        const alivePlayers = countAlivePlayers(gamedata);
        const alivePlayersVoted = countAlivePlayersWithVotes(gamedata);
        if (alivePlayersVoted === alivePlayers) {
          const votedForData = getVotedForCounts(gamedata);
          const mostVoted = getTopVotedPlayer(votedForData);
          if (mostVoted) {
            const killedPlayerIndex = gamedata.players.findIndex(p => p.username === mostVoted);
            gamedata.players[killedPlayerIndex].alive = false;
            let killedPlayerName = gamedata.players[killedPlayerIndex].username;
            const alivePlayersCount = countAlivePlayers(gamedata);
            if (alivePlayersCount === 2) {
              // Call the endgame function
              endgameRoute(req, res);
            } else {
              // Reset voted and votedFor for all players
              gamedata.players.forEach(player => {
                player.voted = false;
                player.votedFor = "";
              });

              // Write the updated gamedata back to the JSON file
              gamedata.night = true;
              fs.writeFile(gameDataFilePath, JSON.stringify(gamedata, null, 2), "utf8", (err) => {
                if (err) {
                  console.error(err);
                  res.status(500).send("Internal Server Error");
                  return;
                }
                res.json({ message: "Player killed successfully", killedPlayerName });
                return;
              });
            }
          } else {
            // TODO ==> change date to NIGHT true, and write to database, and update voted, voted.for.
            res.json({ message: "No majority vote or a tie, no death" });
            return;
          }
        } else {
          res.json({ message: "OK" });
          return;
        }
      }
    });

    return router;
  });
};
