'use strict';
const path = require('path');
const webpack = require('webpack');
require('es6-promise').polyfill();
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

function webpackConfig(target, mode) {
  let filename;
  if (target === 'var') {
    filename = `painterro-${require('./package.json').version}.min.js`
  } else if (target === 'var-latest') {
    filename = 'painterro.min.js';
    target = 'var';
  } else {
    filename = `painterro.${target}.js`;
  }

  let options = {
    mode,
    entry: ["core-js/stable", "regenerator-runtime/runtime", './js/main.js'],
    output: {
      path: path.resolve(__dirname, 'build'),
      filename,
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
          exclude: /node_modules/,
          options: {
            // sourceType: "module",
            presets: [["@babel/preset-env", {
              "modules": "commonjs",
              "targets": {
                "ie": "11"
              }
            }]],
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
  }
  if (target === 'var') {
    options.output.library = 'Painterro';
    options.output.libraryExport = 'default';
    options.target = 'es5';

  }
  if (mode === 'development') {
    options = {
      ...options,
      devServer: {
        injectClient: false,
        static: path.join(__dirname, 'build'),
        hot: true,
      },
      devtool: 'inline-source-map',
      plugins: [
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: `report-${target}.html`,
          openAnalyzer: false,
        }),
      ],
    }
  }
  return options;
}

const isDevServer = process.argv.find(v => v.includes('serve'));

if (!isDevServer) {
  console.log('Building production');
  module.exports = [
    webpackConfig('var', 'production'),
    webpackConfig('var-latest', 'production'),
    webpackConfig('commonjs2', 'production'),
    webpackConfig('amd', 'production'),
    webpackConfig('umd', 'production')
  ];
} else {
  console.log('Building development');
  module.exports = [webpackConfig('var-latest', 'development')];
}