'use strict';
const path = require('path');
const webpack = require('webpack');
require('es6-promise').polyfill();

function webpackConfig(target) {
  let filename;
  if (target === 'var') {
    filename = `painterro-${require("./package.json").version}.min.js`
  } else if (target === 'var-latest') {
    filename = `painterro.min.js`
    target = 'var'
  } else {
    filename = `painterro.${target}.js`
  }

  return {
    entry: './js/main.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: filename,
      library: 'Painterro', // export as library
      libraryTarget: target
    },
    module: {
      loaders: [
        {
          enforce: "pre",
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "eslint-loader",
        },
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
          test: /\.(ttf|woff|woff2|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: "url-loader"
        }
      ]
    },
    stats: {
      colors: true
    },

    devtool: 'source-map',
    devServer: {
      disableHostCheck: true
    }
  }
}

const isDevServer = process.argv.find(v => v.includes('webpack-dev-server'));

if (!isDevServer) {
  module.exports = [
    webpackConfig('var'),
    webpackConfig('var-latest'),
    webpackConfig('commonjs2'),
    webpackConfig('amd'),
    webpackConfig('umd')
  ];
} else {
  module.exports = [
    webpackConfig('var-latest'),
  ];
}