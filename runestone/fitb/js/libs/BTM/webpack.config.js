const path = require('path');

module.exports = {
  entry: './src/BTM_root.js',
  mode: 'development',
  output: {
    filename: 'BTM.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
