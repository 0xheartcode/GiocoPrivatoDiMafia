let closing = false;

function handleSIGINT(ircClient) {
  process.on('SIGINT', () => {
    if (!closing) {
      closing = true;
      console.log('Received SIGINT. Closing IRC connection...');

      ircClient.disconnect('Bot is shutting down.', () => {
        console.log('IRC connection closed.');
        process.exit(0);
      });
    }
  });
}

module.exports = {
  handleSIGINT,
};


