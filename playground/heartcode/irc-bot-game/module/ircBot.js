const irc = require('irc');

function createIRCClient(botName, channelName) {
  return new irc.Client('irc.freenode.net', botName, {
    channels: [channelName],
  });
}

module.exports = {
  createIRCClient,
};


