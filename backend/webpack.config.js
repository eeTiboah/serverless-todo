const path = require('path');
const slsw = require('serverless-webpack');
// var nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  // externals: [nodeExternals()],
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' },
      
    ],
  },
};


// {
//   test: /\.json$/,
//   use: 'json-loader',
// },
// {
//   test: /\.(js)x?$/,
//   exclude: /node_modules/,
//   use: 'babel-loader',
// },
// {
//   test: /\.(ts)x?$/,
//   exclude: /node_modules|\.d\.ts$/, // this line as well
//   use: {
//     loader: 'ts-loader',
//     options: {
//     compilerOptions: {
//     noEmit: false, // this option will solve the issue
//    },
//   },
//  },
// },