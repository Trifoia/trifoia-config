'use strict';
const trifoiaConfig = require('./config.js');

// Minimal usage
let config = trifoiaConfig();
console.log(config);

// User provided base object
config = trifoiaConfig(require('./.conf.default.js'));
console.log(config);

// Intellisense support
config = require('./.conf.default'); trifoiaConfig(config);
console.log(config);

// JSDoc Type Definition for Intellisense support
/**
 * @type {import('./.conf.default')}
 */
config = trifoiaConfig();
console.log(config);
