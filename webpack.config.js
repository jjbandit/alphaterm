module.exports = {
  entry: './src/script/index.js',
  output: { filename: 'lib/bundle.js' },
  target: 'node',
  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['env'] }
        }
      }
    ]
  },

}
