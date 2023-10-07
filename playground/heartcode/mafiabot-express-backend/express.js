const express = require("express");
const fs = require("fs");
require("dotenv").config();
const sse = require("express-sse"); // Import the connectiondataPath module
const cors = require("cors"); // Import the cors middleware
const compression = require("compression");

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON in request body
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.use(compression());


const gamedataFilePath = "gamedata.json";

// Importing route handlers from other files
const sheriffRoute = require("./routes/sheriff");
const mafiaRoute = require("./routes/mafia")();
const voteRoute = require("./routes/vote")();

const eventsRoute = require("./routes/events");
const playerReadyRoute = require("./routes/playerreadyroute");

// Using the route handlers
app.use("/sheriff", sheriffRoute);
app.use("/mafia", mafiaRoute);
app.use("/vote", voteRoute);

// Using the events route
// app.use('/events', eventsRoute);
app.use("/playerready", playerReadyRoute);


const sseStream = new sse();

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  sseStream.init(req, res); // Initialize SSE stream
});

// In response to an event or data change, send updates to connected clients
app.post("/send-update", (req, res) => {
  // sseStream.send(JSON.stringify({ hola: 'hola' }), 'customEvent', 'uniqueEventID');
  sseStream.send(JSON.stringify({ message: "Server says hello!" }), "hola", "gdsg");
  res.status(200).send("Update sent");
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

