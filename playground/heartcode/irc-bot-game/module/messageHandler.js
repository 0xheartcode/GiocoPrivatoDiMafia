// messageHandler.js

const gameManager = require('./gameManager');

function handleMessage(from, to, message, ircClient, botNickname) {
  console.log(`[IRC] <${from}> ${message}`);

  // Check if the message is a "/hello" command
  if (message === 'hello') {
    ircClient.say(to, `Hello, ${from}!`);
    // Log the bot's response
    console.log(`[BOT] <${ircClient.nick}> Hello, ${from}!`);
  }

  // Check if the message is "-bot ready"
  if (message === '-bot ready') {
    gameManager.playerReady(from, ircClient);
  }

  // Check if all players are ready to start the game
  if (gameManager.areAllPlayersReady()) {
    // All players are ready, initialize the game
    gameManager.initializeGame(ircClient, botNickname);
  }
}

module.exports = {
  handleMessage,
};

