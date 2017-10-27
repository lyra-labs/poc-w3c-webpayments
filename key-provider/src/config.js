import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

export default {
  hostname: argv.hostname || '0.0.0.0',
  port: argv.port || 9092,
  merchantHost: argv.merchantHost || 'http://localhost:9093',
  backend: argv.backend || 'payzen',
};
