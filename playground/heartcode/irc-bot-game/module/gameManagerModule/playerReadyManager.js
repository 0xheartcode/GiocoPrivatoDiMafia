// gameManager/playerReadyManager.js

let playersReady = [];

function playerReady(nickname, ircClient) {
  if (!playersReady.includes(nickname)) {
    playersReady.push(nickname);
    const remainingPlayers = playersReady.length;

    ircClient.say(
      '#awesomeplayground',
      `Player ${nickname} is ready. Waiting ${remainingPlayers}/4 players.`
    );

    console.log(
      `[BOT] <${ircClient.nick}> Player ${nickname} is ready. Waiting for ${remainingPlayers}/4 players.`
    );

  }
}

function playersReadyCount() {
  return playersReady.length;
}

module.exports = {
  playerReady,
  playersReadyCount,
};

