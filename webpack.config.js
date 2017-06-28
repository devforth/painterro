var path = require('path');
var webpack = require('webpack');


function webpackConfig(target) {
  return {
    entry: './js/main.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: `painterro.${target == 'var' && '' || target}.js`,
      library: 'Painterro', // export as library
      libraryTarget: target
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

module.exports = [
  webpackConfig('var'),
  webpackConfig('commonjs2'),
  webpackConfig('amd'),
  webpackConfig('umd')
];