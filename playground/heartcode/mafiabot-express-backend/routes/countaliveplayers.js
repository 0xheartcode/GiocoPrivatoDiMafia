// Function to count the number of alive players
function countAlivePlayers(gamedata) {
  return gamedata.players.filter(player => player.alive).length;
}

module.exports = countAlivePlayers;
