import path from 'path';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mustache from 'mustache-express';
import config from './config';
import Router from './Router';

const app = express();

// configure template engine (mustache)
app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// enable parsing of request body
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));

// enable CORS for merchant's requests
app.use(cors({
  origin: (origin, callback) => {
    if (config.allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

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

// route specific to Mock backend
app.post('/acsChallenge', router.acsChallenge.bind(router));

// start server
app.listen(config.port, config.hostname, (err) => {
  if (err) {
    throw err;
  }

  // eslint-disable-next-line no-console
  console.log(`> Key Provider is listening on http://${config.hostname}:${config.port} (backend = ${config.backend})`);
});
