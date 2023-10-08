const irc = require('irc');

// Define your bot name and channel name
const botName = 'MafiaMayor';
const channelName = '#awesomeplayground';

// Configure the IRC bot
const ircClient = new irc.Client('irc.freenode.net', botName, {
  channels: [channelName],
});

// Listen for IRC messages and log them
ircClient.addListener('message', (from, to, message) => {
  // Log all IRC messages to the console
  console.log(`[IRC] <${from}> ${message}`);

  // Check if the message is a "/hello" command
  if (message === 'hello') {
    // Respond with a hello message
    ircClient.say(to, `Hello, ${from}!`);
  }
});

// Start the IRC bot
ircClient.addListener('registered', () => {
  console.log(`IRC bot is connected to the server and ${channelName}.`);
});

// Handle IRC errors
ircClient.addListener('error', (message) => {
  console.error(`IRC error: ${message}`);
});


// Handle Ctrl+C (SIGINT) to gracefully close the IRC connection
process.on('SIGINT', () => {
  if (!closing) {
    closing = true; // Set the closing flag to true to prevent multiple messages
    console.log('Received SIGINT. Closing IRC connection...');
    
    // Disconnect the IRC client gracefully
    ircClient.disconnect('Bot is shutting down.', () => {
      console.log('IRC connection closed.');
      process.exit(0); // Exit the script gracefully
    });
  }
});

