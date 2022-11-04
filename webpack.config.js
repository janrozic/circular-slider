const path = require('path');

module.exports = {
  entry: './index.ts',
  mode: "development",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'CircularSlider',
      type: 'var',
      export: 'default',
    },
  },
};