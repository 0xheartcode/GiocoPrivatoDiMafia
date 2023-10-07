function handleJoin(channel, nick) {
  console.log(`[IRC] ${nick} joined ${channel}`);
}

function handlePart(channel, nick, reason) {
  console.log(`[IRC] ${nick} left ${channel} (${reason || 'no reason'})`);
}

function handleKick(channel, nick, by, reason) {
  console.log(`[IRC] ${nick} was kicked from ${channel} by ${by} (${reason || 'no reason'})`);
}

module.exports = {
  handleJoin,
  handlePart,
  handleKick,
};


