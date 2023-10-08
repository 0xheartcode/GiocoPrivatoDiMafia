const express = require("express");
const uuid = require("uuid");
const { sseStream } = require("../express");
const fs = require("fs");
const { connectionFilePath } = require("../db/dbPaths");

const router = express.Router();

router.get("/", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  sseStream.init(req, res); // Initialize SSE stream

  let clientId = uuid.v4();
  const playerName = req.query.playerName;

   // Read the existing data from the JSON file (if any)
  let existingData = [];
  try {
    existingData = JSON.parse(fs.readFileSync(connectionFilePath, "utf8"));
  } catch (error) {
    // TODO
  }

  // If it exists already
  const existingItem = existingData.find(item => item.playerName === playerName);
  if (!existingItem) existingData.push({ clientId, playerName, connected: true });
  fs.writeFileSync(connectionFilePath, JSON.stringify(existingData, null, 2));


  sseStream.send(JSON.stringify({ uuid: clientId }), "GET_UUID", "GET_UUID");
});

module.exports = router;

