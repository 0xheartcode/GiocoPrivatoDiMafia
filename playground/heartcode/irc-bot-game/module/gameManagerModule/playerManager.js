// gameManager/playerManager.js

let playerCount = 0;

function increasePlayerCount() {
  playerCount++;
}

function decreasePlayerCount() {
  playerCount--;
}

function setPlayerCount(count) {
  playerCount = count;
}

function getPlayerCount() {
  return playerCount;
}

module.exports = {
  increasePlayerCount,
  decreasePlayerCount,
  setPlayerCount,
  getPlayerCount,
};


