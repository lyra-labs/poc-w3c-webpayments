const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

module.exports = {
  hostname: argv.hostname || '0.0.0.0',
  port: argv.port || 9093,
  keyProviderURL: argv.keyProviderURL || 'http://localhost:9092',
  demoStoreURL: argv.demoStoreURL || 'http://localhost:9093',
};
