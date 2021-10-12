'use strict';
const simplyConfig = require('./config.js');

// Minimal usage
let config = simplyConfig();
console.log(config);

// User provided base object
config = simplyConfig(require('./.conf.default.js'));
console.log(config);

// Intellisense support
config = require('./.conf.default'); simplyConfig(config);
console.log(config);

// JSDoc Type Definition for Intellisense support
/**
 * @type {import('./.conf.default')}
 */
config = simplyConfig();
console.log(config);
