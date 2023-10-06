// gameManager/gameManager.js

const playerManager = require('./gameManagerModule/playerManager');
const playerReadyManager = require('./gameManagerModule/playerReadyManager');
const displayManager = require('./gameManagerModule/displayManager');
const messageManager = require('./gameManagerModule/messageManager');
const roleManager = require('./gameManagerModule/roleManager');
const { initializeGame } = require('./gameManagerModule/initializeManager');
const { welcomeMessage } = require('./gameManagerModule/welcomeMessage');


function areAllPlayersReady() {
  // Check if the number of players ready is equal to the total number of players
  return playerReadyManager.playersReadyCount() === playerManager.getPlayerCount()-1;
}

module.exports = {
  increasePlayerCount: playerManager.increasePlayerCount,
  decreasePlayerCount: playerManager.decreasePlayerCount,
  setPlayerCount: playerManager.setPlayerCount,
  displayStartMessage: displayManager.displayStartMessage,
  playerReady: playerReadyManager.playerReady,
  getPlayerCount: playerManager.getPlayerCount,
  areAllPlayersReady, // Add this function
  initializeGame, // Export only initializeGame
};

