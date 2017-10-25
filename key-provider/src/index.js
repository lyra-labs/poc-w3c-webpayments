import express from 'express';
import bodyParser from 'body-parser';
import config from 'config';
import minimist from 'minimist';
import * as routes from './routes';

const argv = minimist(process.argv.slice(2));
const hostname = argv.hostname || config.hostname;
const port = argv.port || config.port;
const merchantHost = argv.merchantHost || config.merchantHost;

const app = express();

// enable json parsing of request body
app.use(bodyParser.json());

// enable CORS for merchant's requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', merchantHost);
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// declare routes
app.get('/obtainEncryptionKey', routes.obtainEncryptionKey);
app.post('/payment', routes.payment);

// start server
app.listen(port, hostname, (err) => {
  if (err) {
    throw err;
  }

  // eslint-disable-next-line no-console
  console.log(`> Key Provider is listening on http://${hostname}:${port}`);
});
