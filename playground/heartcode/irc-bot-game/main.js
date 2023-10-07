const ircBotModule = require('./module/ircBot');
const messageHandlerModule = require('./module/messageHandler');
const joinPartHandlerModule = require('./module/joinPartHandler');
const sigintHandlerModule = require('./module/sigintHandler');
const gameManagerModule = require('./module/gameManager');

const botName = 'MafiaMayor';
const channelName = '#awesomeplayground';

const ircClient = ircBotModule.createIRCClient(botName, channelName);
// Function to check initial number of users when the bot joins
//
//
ircClient.addListener('names', (channel, nicks) => {
  const userCount = Object.keys(nicks).length;
  gameManagerModule.setPlayerCount(userCount);

  gameManagerModule.displayStartMessage(ircClient);
});

ircClient.addListener('message', (from, to, message) => {
  messageHandlerModule.handleMessage(from, to, message, ircClient, botName);
});

ircClient.addListener('action', (from, to, text) => {
  messageHandlerModule.handleAction(from, to, text);
});

ircClient.addListener('join', (channel, nick) => {
  joinPartHandlerModule.handleJoin(channel, nick);

  // Increase player count
  gameManagerModule.increasePlayerCount();
  // Display start message after updating player count
  gameManagerModule.displayStartMessage(ircClient);

});

ircClient.addListener('part', (channel, nick, reason) => {
  joinPartHandlerModule.handlePart(channel, nick, reason);

  // Decrease player count and display start message
  gameManagerModule.decreasePlayerCount();
});

ircClient.addListener('kick', (channel, nick, by, reason) => {
  joinPartHandlerModule.handleKick(channel, nick, by, reason);
});


ircClient.addListener('registered', () => {
  console.log(`IRC bot is connected to the server and ${channelName}.`);
});

ircClient.addListener('error', (message) => {
  console.error(`IRC error: ${message}`);
});

// Set up SIGINT handling
sigintHandlerModule.handleSIGINT(ircClient);


