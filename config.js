'use strict';

/*
  This configuration utility is designed to allow the definition of important constants in a
  way that is compatible with VSCode Intellisense.

  Secret (ignored) configurations can be set in a `.conf.js` file, and will overwrite default
  configurations. Environment variables can also be used to define string values, using the
  following format for the shell variable name:
    `config_${sectionKey}_${itemKey}`

  This utility expects there to be a `.conf.default.js` file in the same directory. The secret
  config file is optional

  See the default config for details on file formatting

  The config object will only get values from the related conf files the first time it is
  imported. Use the `config.loadConfig` method to force a read from file.

  Optional use of config.js to generate shell variables
  ---
  If this config.js script is invoked via a bash shell, then it will load the config files
  as normal, but will output to stdout a list of one or more bash variable definitions.
  By default, with no arguments, a list of all the definitions in the various .conf.* files
  will be generated. For example:
    > node config.js
  will output (some secrets elided with '...'):
    export config_config_errorOnUndefined=false
    export config_cdk_suffix="dank"
    export config_cdk_lambdaTimeout=60
    export config_cdk_lambdaMemorySize=128
    export config_cdk_lambdaRetryAttempts=0
    export config_api_domainName="apidank.selsgplus.com"
    export config_aws_region="us-east-1"
    export config_aws_accountId="...."
    export config_aws_accessKeyId=
    export config_aws_secretAccessKey=
    export config_cognito_userPoolId="..."
    export config_cognito_clientId="..."
    export config_cognito_accessTokenValidityMinutes=10
    export config_cognito_idTokenValidityMinutes=10
    export config_cognito_testingEmail="..."
    export config_cognito_testingPassword="..."
      ...

  If section.item pairs are passed to this script, then the output will be restricted
  to the section.item pairs. For example:
    > node config.js cognito
  will just emit the items from the cognito section:
    export config_cognito_userPoolId="..."
    export config_cognito_clientId="..."
    export config_cognito_accessTokenValidityMinutes=10
    export config_cognito_idTokenValidityMinutes=10
    export config_cognito_testingEmail="..."
    export config_cognito_testingPassword="..."

  And the usual case is to specifically select the pairs that are needed. For example,
  if we only need cognito.userPoolId and cognito.clientId:
    > node config.js cognito.userPoolId cognito.clientId
  generates shell variable definitions for only those two items:
    export config_cognito_userPoolId="us-east-1_XSL3FTBsK"
    export config_cognito_clientId="5pa6kr7q6hb91e9ifagion68u"

  Using 'eval' to avoid generating files with secrets
  ---
  In order to avoid generating files that may contain secrets, it is possible to import
  the generated variables directly into the shell, without exposing any secrets to the filesystem
  or to the command line history or logs:
    eval "$(node config.js \
      cognito.userPoolId \
      cognito.clientId \
      cognito.testingEmail \
      cognito.testingPassword \
      )"
    echo "cognito.userPoolId: ${config_cognito_userPoolId}""
*/

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
          if (!isNaN(num)) category[valueKey] = num;
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

// https://nodejs.org/docs/latest/api/all.html#modules_accessing_the_main_module
// https://coding.pstodulka.com/2014/10/22/node-modules-as-cli/

if (require.main == module) {
  // When invoked from a shell, write the config data (or a selected subset) to stdout.
  // By default, the output written will be shell-compatible variable declarations of the form:
  //  CONF_section_item
  // In the future, it may be desirable to generate alternative formats, but not today.
  
  
  const workingDir = process.cwd();

  const config = loadConfig();
  // const config = require(path.join(workingDir, '.conf.default.js'));


  const lines = [];

  const addVariableDefinition = (section, item) => {
    const value = config[section][item];
    const lhs = `config_${section}_${item}`;
    const rhs = (value === undefined) ?
      '' :
      JSON.stringify(value);

    lines.push(`export ${lhs}=${rhs}`);
  };

  if (process.argv.length > 2) {
    const sectionItemPairs = process.argv.slice(2);

    for (const sectionItemPair of sectionItemPairs) {
      const pathElements = sectionItemPair.split('.');
      const section = pathElements[0];
      if (pathElements.length === 1) {
        const sectionValue = config[section];

        if (typeof sectionValue === 'object') {
          for (const item of Object.keys(config[section])) {
            addVariableDefinition(section, item);
          }
        }
      }
      else if (pathElements.length === 2) {
        const item = pathElements[1];
        addVariableDefinition(section, item);
      }
    }
  }
  else {
    for (const section of Object.keys(config)) {
      for (const item of Object.keys(config[section])) {
        addVariableDefinition(section, item);
      }
    }
  }
  lines.push('');

  process.stdout.write(lines.join('\n'));
}
else {
  // Make loadConfig() available via the default config object.

  // config.loadConfig = loadConfig;
  // module.exports = config;

  module.exports = loadConfig;

}
