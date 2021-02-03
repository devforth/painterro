'use strict';
const path = require('path');
const webpack = require('webpack');
require('es6-promise').polyfill();
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require("terser-webpack-plugin");

function webpackConfig(target) {
  let filename;
  if (target === 'var') {
    filename = `painterro-${require('./package.json').version}.min.js`
  } else if (target === 'var-latest') {
    filename = 'painterro.min.js';
    target = 'var';
  } else {
    filename = `painterro.${target}.js`;
  }

  return {
    entry: './js/main.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename,
      library: 'Painterro', // export as library
      libraryTarget: target,
    },
    module: {
      rules: [
        {
          enforce: "pre",
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "eslint-loader",
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'es2016']
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
    },
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: `report-${target}.html`,
      }),
    ]
  }
}

const isDevServer = process.argv.find(v => v.includes('serve'));

if (!isDevServer) {
  module.exports = [
    webpackConfig('var'),
    webpackConfig('var-latest'),
    webpackConfig('commonjs2'),
    webpackConfig('amd'),
    webpackConfig('umd')
  ];
} else {
  module.exports = webpackConfig('var-latest');
}