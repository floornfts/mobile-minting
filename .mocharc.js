'use strict';
const path = require('path');
const dotenv = require('dotenv');
console.log('Loading dotenv to process .env');
dotenv.config();

module.exports = {
  extension: ['ts', 'js'],
  package: path.join(__dirname, './package.json'),
  ui: 'bdd',
  spec: ['./test/**/*.test.*'],
  exit: true,
  timeout: 20000,
  recursive: true,
};
