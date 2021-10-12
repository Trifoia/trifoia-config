'use strict';

const path = require('path');

/**
 * Simple helper determines if a value exists in a config object
 *
 * @param {object} obj Object to check
 * @param {string} categoryKey Category to check
 * @param {string} valueKey Name of the value to check
 */
const checkExists = (obj, categoryKey, valueKey) => {
  return obj[categoryKey] && typeof obj[categoryKey][valueKey] !== 'undefined';
};

/**
 * Helper function recursively travels a provided object and returns "false" if any values are undefined. A log
 * will also be automatically made to stderr detailing the nature of the failure
 * 
 * @param {object} obj The object to check
 * @param {string} originalKey The key related to the object being checked
 */
const checkForUndefinedRecursive = (obj, originalKey = 'this') => {
  if (typeof obj === 'undefined') {
    console.error(`Item with key ${originalKey} is undefined`);
    return false;
  }

  // Don't check strings
  if (typeof obj === 'string') return true;

  // For-in statements don't run on non-indexed data types
  for (const key in obj) {
    const item = obj[key];

    if (!checkForUndefinedRecursive(item, key)) return false;
  }

  return true;
};

/**
 * @typedef ConfigOpts
 * @property {object} [overrides] Object that matches the main `config` object and will override
 *  any matching values no matter where else the configuration value may be defined
 * @property {string} [workingDir] The current working directory. Defaults to the value returned
 *  by `process.cwd()`
 * @property {boolean} [disableEnvarParsing] Set to `true` to turn off automatic parsing of
 *  environment variables
 */

/**
 * Takes an object and then performs configuration setup procedures upon that object. The
 * provided object is directly altered
 *
 * @param {object} config The object to which the configurations should be applied
 * @param {ConfigOpts} [opts] Additional options for config setup
 */
const loadConfig = (config = null, opts = {}) => {
  const {overrides, workingDir = process.cwd()} = opts;

  if (!config) {
    config = require(path.join(workingDir, '.conf.default.js'));
  }

  let secretConfig = {};
  try {
    secretConfig = require(path.join(workingDir, '.conf.js'));
  } catch(e) {
    // Allow error
  }

  for (const categoryKey in config) {
    const category = config[categoryKey];

    for (const valueKey in category) {
      // Check for the value in the configuration overrides
      if (overrides && checkExists(overrides, categoryKey, valueKey)) {
        category[valueKey] = overrides[categoryKey][valueKey];
        continue;
      }

      // Check for the value in environment vars
      const varName = `conf_${categoryKey}_${valueKey}`;
      // console.log(process.env, varName, process.env[varName]);
      if (process.env[varName]) {
        category[valueKey] = process.env[varName];

        if (opts.disableEnvarParsing !== true) {
          // Try to parse envars as json
          try {
            category[valueKey] = JSON.parse(category[valueKey]);
          } catch(e) {
            // Allow failure, this must not be a JSON string
          }

          // Try to parse envars as numbers
          const num = Number(category[valueKey]);
          if (num !== NaN) category[valueKey] = num;
        }
        continue;
      }

      // Check for the value in the secret config
      if (checkExists(secretConfig, categoryKey, valueKey)) {
        category[valueKey] = secretConfig[categoryKey][valueKey];
        continue;
      }
    }
  }

  if (config.config && config.config.errorOnUndefined && !checkForUndefinedRecursive(this)) {
    throw new Error('Undefined configurations detected');
  }

  return config;
};

module.exports = loadConfig;
