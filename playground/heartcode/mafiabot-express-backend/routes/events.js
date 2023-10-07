// events.js
const express = require('express');
const fs = require('fs');
const uuid = require('uuid');
const connectiondataPath = require('../connectiondataPath'); // Import the connectiondataPath module

const router = express.Router();

const clients = {};

router.use((req, res, next) => {
  const clientId = uuid.v4();
  const playerName = req.body.playerName; // Extract playerName from the request body
  clients[clientId] = res;
  req.clientId = clientId;

  // Read the contents of the connectiondata.json file
  fs.readFile(connectiondataPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
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

    // Add a new connection
    connections.push({ clientId, playerName, connected: true });

    // Write the updated connections back to the JSON file
    fs.writeFile(connectiondataPath, JSON.stringify(connections, null, 2) + '\n', 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing to connectiondata.json:', writeErr);
        res.status(500).send('Internal Server Error');
        return;
      }

      console.log('Connection added to connectiondata.json');
    });
  });

  next();
});

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  res.write(`event: connection\nid: ${req.clientId}\ndata: Connected\n\n`);

  req.on('close', () => {
    // Update the connectiondata.json file to mark the client as disconnected
    fs.readFile(connectiondataPath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      let connections = [];
      try {
        connections = JSON.parse(data);
      } catch (parseError) {
        console.error(`Error parsing connectiondata.json: ${parseError.message}`);
        return;
      }

      // Find the connection entry and mark it as disconnected
      const connectionIndex = connections.findIndex(connection => connection.clientId === req.clientId);
      if (connectionIndex !== -1) {
        connections[connectionIndex].connected = false;

        // Write the updated connections back to the JSON file
        fs.writeFile(connectiondataPath, JSON.stringify(connections, null, 2) + '\n', 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('Error writing to connectiondata.json:', writeErr);
          } else {
            console.log('Connection marked as disconnected in connectiondata.json');
          }
        });
      }

      delete clients[req.clientId];

      // Avoid sending multiple responses
      if (!res.headersSent) {
        res.end();
      }
    });
  });
});

module.exports = router;

