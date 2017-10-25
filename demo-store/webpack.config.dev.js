const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    'babel-polyfill',
    'webpack-hot-middleware/client?reload=true',
    path.resolve(__dirname, 'src/index.jsx'),
  ],

  resolve: {
    extensions: ['.js', '.json', '.jsx'],
  },

  devtool: 'inline-source-map',

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|payment-request-polyfill)/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'assets/[name].[hash:8].[ext]',
        },
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
    new HtmlWebpackPlugin({
      template: path.resolve('src/index.ejs'),
      favicon: path.resolve('src/resources/imgs/favicon.ico'),
      inject: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],

  output: {
    pathinfo: true,
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
};
