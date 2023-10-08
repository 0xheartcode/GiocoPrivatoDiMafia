// playerReadyRoute.js
const express = require('express');
const fs = require('fs');
const {connectionFilePath,lobbyDataFilePath} = require('../db/dbPaths'); // Import the connectiondataPath module
const startgameRoute = require('./startgame');
const router = express.Router();

router.post('/', (req, res) => {
  const { uuid } = req.body;
  console.log(req.body)

  // Read the contents of the connectiondata.json file
  fs.readFile(connectionFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading connectiondata.json: ${err.message}`);
      res.status(500).send('Internal Server Error');
      return;
    }

    let connections = [];
    try {
      connections = JSON.parse(data);
    } catch (parseError) {
      console.error(`Error parsing connectiondata.json: ${parseError.message}`);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Find the connection entry based on uuid
    const connection = connections.find((conn) => conn.clientId === uuid);
    console.log(uuid)
    if (!connection) {
      console.error('Connection not found for the given uuid');
      res.status(400).send('Bad Request');
      return;
    }

    const playerName = connection.playerName;

    // Read the contents of the lobbydata.json file
    fs.readFile(lobbyDataFilePath, 'utf8', (lobbyErr, lobbyData) => {
      if (lobbyErr) {
        console.error(`Error reading lobbydata.json: ${lobbyErr.message}`);
        res.status(500).send('Internal Server Error');
        return;
      }

      let lobby = {};
      try {
        lobby = JSON.parse(lobbyData);
      } catch (parseError) {
        console.error(`Error parsing lobbydata.json: ${parseError.message}`);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Update or initialize the lobby information
      let lobbyId = lobby.lobbyId || '0'; // Assuming default lobbyId is '0'
      let lobbyCount = lobby.lobbyCount || 0;
      let playerList = lobby.player || [];

      // Check if the player is already in the lobby
      const existingPlayerIndex = playerList.findIndex((player) => player.uuid === uuid);
      if (existingPlayerIndex === -1) {
        // Add the player to the lobby
        playerList.push({ playerName, uuid });
        lobbyCount++;
      } else {
        // Update the player's information if already in the lobby
        playerList[existingPlayerIndex] = { playerName, uuid };
      }

      // Update the lobby data
      const updatedLobbyData = {
        lobbyId,
        lobbyCount,
        player: playerList,
      };

      // Write the updated lobby data back to the lobbydata.json file
      fs.writeFile(lobbyDataFilePath, JSON.stringify(updatedLobbyData, null, 2) + '\n', 'utf8', (writeErr) => {
        if (writeErr) {
          console.error(`Error writing to lobbydata.json: ${writeErr.message}`);
          res.status(500).send('Internal Server Error');
          return;
        }

        console.log('Lobby data updated in lobbydata.json');
        
        // Check if there are 6 players in the lobby
        if (lobbyCount === 2) {
          console.log('Lobby is full! Ready to start the game.');
          // Extract player names from the lobbydata.json file
          const playerData = playerList.map((player) => ({ playerName: player.playerName, uuid: player.uuid }));

          // Call the startgameRoute with the playerNames information
          startgameRoute(playerData)(req, res);
         } else {
          // Send the response if the lobby is not full
          res.status(200).send('OK');
        }

      });
    });
  });
});

module.exports = router;

