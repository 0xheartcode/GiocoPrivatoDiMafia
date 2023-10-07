// gameManager/roleManager.js
const { sendAndLogMessage } = require('./messageManager');


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function assignRoles(ircClient, channel, botNickname) {
  const players = Object.keys(ircClient.chans[channel].users).filter(player => player !== botNickname);
  const roles = ['Townspeople', 'Townspeople', 'Sheriff', 'Mafia'];
  shuffleArray(roles);

  const playerRoles = {};

  players.forEach((player, index) => {
    const roleMessage = `Player ${player}, you are a ${roles[index]}.`;
    sendAndLogMessage(ircClient, channel, roleMessage);
    console.log(`${player}: ${roles[index]}`);
    playerRoles[player] = roles[index];
  });

  const summaryMessage = 'Roles have been assigned. Let the game begin!';
  sendAndLogMessage(ircClient, channel, summaryMessage);

  return playerRoles;
}

module.exports = {
  assignRoles,
};


