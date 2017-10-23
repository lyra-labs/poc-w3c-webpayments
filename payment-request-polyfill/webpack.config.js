const path = require('path');

module.exports = {
  entry: './src/js/index.js',

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader',
      },
    ],
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'payment-request-polyfill.js',
    library: 'PaymentRequestPolyfill',
    libraryTarget: 'umd',
  },
};
