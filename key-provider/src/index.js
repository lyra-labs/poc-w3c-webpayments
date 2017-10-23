import express from 'express';
import bodyParser from 'body-parser';
import config from 'config';
import * as routes from './routes';

const app = express();

// enable json parsing of request body
app.use(bodyParser.json());

// enable CORS for merchant's requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.merchantHost);
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// declare routes
app.get('/:requestId/obtainEncryptionKey', routes.obtainEncryptionKey);
app.post('/:requestId/payment', routes.payment);

// start server
app.listen(config.port, () => {
  console.log(`Key provider listening on port ${config.port}`); // eslint-disable-line no-console
});
