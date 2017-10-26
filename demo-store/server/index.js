const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mustache = require('mustache-express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('../webpack.config.dev.js');
const config = require('../config');

const isDeveloping = process.env.NODE_ENV !== 'production';
const app = express();

app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/paymentRequestPolyfill.js', (req, res) => {
  const libPath = path.resolve(__dirname, '../node_modules/payment-request-polyfill/dist/payment-request-polyfill.js');
  res.sendFile(libPath);
});

app.post('/acsReturn', (req, res) => {
  res.render('acsReturn', {
    paymentUrl: `${config.keyProviderURL}/payment`,
    body: JSON.stringify(req.body),
  });
});

if (isDeveloping) {
  // DEVELOPMENT

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
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });
} else {
  // PRODUCTION

  app.use(express.static(`${__dirname}/dist`));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

app.listen(config.port, config.hostname, (err) => {
  if (err) {
    throw err;
  }

  // eslint-disable-next-line no-console
  console.info(`> Demo Store is listening on http://${config.hostname}:${config.port}`);
});
