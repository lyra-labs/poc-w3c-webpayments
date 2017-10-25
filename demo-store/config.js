const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

module.exports = {
  hostname: argv.hostname || 'localhost',
  port: argv.port || 3000,
  keyProviderURL: argv.keyProviderURL || 'http://localhost:3042',
};
