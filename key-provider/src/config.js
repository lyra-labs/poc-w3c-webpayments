import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

// eslint-disable-next-line no-nested-ternary
const allowedOrigins = argv.allowedOrigins
  ? (typeof argv.allowedOrigins === 'string' ? [argv.allowedOrigins] : argv.allowedOrigins)
  : ['http://localhost:9093'];

export default {
  hostname: argv.hostname || '0.0.0.0',
  port: argv.port || 9092,
  backend: argv.backend || 'mock',
  keyProviderURL: argv.keyProviderURL || 'http://localhost:9092',
  allowedOrigins,
};
