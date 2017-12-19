/* eslint-disable global-require, import/no-extraneous-dependencies */

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mustache = require('mustache-express');
const config = require('../config');

const root = path.join(__dirname, '..');
const isDeveloping = process.env.NODE_ENV !== 'production';
const app = express();

// configure template engine (mustache)
app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// enable urlencoded parsing of request body
app.use(bodyParser.urlencoded({ extended: false }));

// serve our Payment Request API polyfill
app.get('/paymentRequestPolyfill.js', (req, res) => {
  res.sendFile(path.join(root, 'node_modules/payment-request-polyfill/dist/payment-request-polyfill.js'));
});

// URL called by the ACS when 3DS authentication is completed
app.post('/acsReturn', (req, res) => {
  res.render('acsReturn', {
    paymentUrl: `${config.keyProviderURL}/payment`,
    body: JSON.stringify(req.body),
  });
});

if (isDeveloping) {
  // -----------
  // DEVELOPMENT
  // -----------

  const webpack = require('webpack');
  const webpackMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpackConfig = require('../webpack.config.dev.js');

  const compiler = webpack(webpackConfig);
  const middleware = webpackMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false,
    },
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('*', (req, res) => {
    res.write(middleware.fileSystem.readFileSync(path.join(root, 'dist/index.html')));
    res.end();
  });
} else {
  // ----------
  // PRODUCTION
  // ----------

  app.use(express.static(path.join(root, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(root, 'dist/index.html'));
  });
}

// start server
app.listen(config.port, config.hostname, (err) => {
  if (err) {
    throw err;
  }

  // eslint-disable-next-line no-console
  console.info(`> Demo Store is listening on http://${config.hostname}:${config.port}`);
});
