import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import config from './config';
import Router from './Router';

const app = express();

// enable parsing of request body
app.use(bodyParser.text());

// enable CORS for merchant's requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.merchantHost);
  next();
});

// enable logger
app.use(morgan('short'));

// declare routes
const router = new Router();
app.get('/encryptionKey', router.getEncryptionKey.bind(router));
app.post('/payment', router.payment.bind(router));
app.get('/pendingKeys', router.getPendingKeys.bind(router));
app.post('/clearPendingKeys', router.clearPendingKeys.bind(router));
app.get('/pendingPayments', router.getPendingPayments.bind(router));
app.post('/clearPendingPayments', router.clearPendingPayments.bind(router));

// start server
app.listen(config.port, config.hostname, (err) => {
  if (err) {
    throw err;
  }

  // eslint-disable-next-line no-console
  console.log(`> Key Provider is listening on http://${config.hostname}:${config.port}`);
});
