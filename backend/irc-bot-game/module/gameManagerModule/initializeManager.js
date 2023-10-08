// gameManager/initializeManager.js
const { sendAndLogMessage } = require('./messageManager');
const { assignRoles } = require('./roleManager');
const { welcomeMessage } = require('./welcomeMessage'); // Add this line

async function initializeGame(ircClient, botNickname) {
  await sendAndLogMessage(ircClient, '#awesomeplayground', welcomeMessage);
  assignRoles(ircClient, '#awesomeplayground', botNickname);
}

module.exports = {
  initializeGame,
};

