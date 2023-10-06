// gameManager/displayManager.js
const playerManager = require('./playerManager');

console.log(playerManager.playerCount)
function displayStartMessage(ircClient) {
  if (playerManager.playerCount >= 4) {
    ircClient.say('#awesomeplayground', '4 people have now joined. Please get ready!');
    console.log(`[BOT] <${ircClient.nick}> 4 people have now joined. Please get ready!`);
  }
}

module.exports = {
  displayStartMessage,
};


