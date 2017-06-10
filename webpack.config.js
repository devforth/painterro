var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './js/main.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'painterro.js',
    library: 'Painterro', // export as library
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
      },
      {
        test: /\.(ttf|woff|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader"
      }
    ]
  },
  stats: {
    colors: true
  },

  devtool: 'source-map',
  devServer: {
  }
};