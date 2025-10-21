// webpack.config.js
import fs from 'fs';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
 


module.exports = {
  entry: {
    // Define multiple entry points
    main_page: './src/main_page.js',
    tribute_page: './src/tribute_page.js',
    toc_bot: './src/toc-bot.js',  // Another entry point
    // Add more files if needed
  },
  output: {
    // Output configuration for different JS files
    path: path.resolve(__dirname, '..', 'assets', 'js'),
    filename: '[name].min.js', // This creates unique file names based on the content
  },
  module: {
    rules: [
      {
        test: /\.js$/,  // Use Babel for all JS files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],  // Transpile to ES5 for better compatibility
          },
        },
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false, // Don't extract comments to a separate file
      }),
    ],
    // Enable splitting for multiple chunks (files)
    splitChunks: {
      chunks: 'all',  // Split all chunks (common code between entry points)
    },
  },

  plugins: [
  ],
  resolve: {
    extensions: ['.js'], // Resolve .js files
  },
};
