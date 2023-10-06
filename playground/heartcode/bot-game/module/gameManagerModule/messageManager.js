// gameManager/messageManager.js

function sendAndLogMessage(ircClient, channel, message) {
  setTimeout(() => {
    ircClient.say(channel, message);
    console.log(message);
  }, 3000); // 5000 milliseconds = 5 seconds
}

module.exports = {
  sendAndLogMessage,
};


