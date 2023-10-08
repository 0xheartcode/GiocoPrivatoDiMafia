require("dotenv").config();

const express = require("express");
const sse = require("express-sse");
const cors = require("cors");
const compression = require("compression");
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON in request body
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: "http://localhost:3000" }));
app.use(compression());

const sseStream = new sse();

module.exports = {
  sseStream
};

const sheriffRoute = require("./routes/sheriff");
const mafiaRoute = require("./routes/mafia")();
const voteRoute = require("./routes/vote");

const eventsRoute = require("./routes/events");
const playerReadyRoute = require("./routes/playerreadyroute");

// Using the route handlers
app.use("/sheriff", sheriffRoute);
app.use("/mafia", mafiaRoute);
app.use("/vote", voteRoute);

// Using the events route
app.use("/events", eventsRoute);
app.use("/playerready", playerReadyRoute);


app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});



