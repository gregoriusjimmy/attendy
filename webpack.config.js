const path = require('path')

module.exports = {
  entry: './src/scripts/attend.script.js',
  //   module: {
  //     rules: [
  //       {
  //         test: /\.tsx?$/,
  //         use: 'ts-loader',
  //         exclude: /node_modules/,
  //       },
  //     ],
  //   },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'attend.bundle.js',
    path: path.resolve(__dirname, 'client', 'assets', 'js'),
  },
  mode: 'development',
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
  },
}
