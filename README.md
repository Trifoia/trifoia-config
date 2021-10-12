# Simply Config
Super simple application configuration

This little module was initially developed as a template file for our Nodejs projects to help deal with magic variables and secret configurations, but has become so useful we've decided to make it it's own thing. This module is specifically designed to work with VSCode intellisense. Also supports environment variables

# Files
By default, this module expects the following files to be present in the current working directory (as returned by `process.cwd()`)
- `.conf.default.js` - Required - The base for configurations
- `.conf.js` - Optional - Secret configurations not meant to be included in source control

The .conf files should have the following form. Use JSDocs in the default configuration file to enable Intellisense support
```js
module.exports = {
  /**
   * Configuration configurations
   * 
   * This is a top level configuration category that includes values that
   * effect the function of the simply-config utility itself
   */
  config: {
    /**
     * If an error should be thrown for `undefined` configuration values
     * 
     * This is a configuration value, these values are overwritten by 
     * priority inputs non-recursively. Any overwritten objects or arrays will
     * be replaced entirely
     */
    errorOnUndefined: false
  },
};
```

Alternatively, a user provided default configurations object may be provided to the module on initialization

# Examples
## Importing
This module support both commonjs and module import paradigms
```js
// Module
import simplyConfig from 'simply-config';

// Commonjs
const simplyConfig = require('simply-config');
```

## Basic Usage
Call the imported method to instantiate the configuration values
```js
// Minimal usage
const config = simplyConfig();

// User provided base object
const config = simplyConfig(require('./.conf.custom.js'));

// Overwrite existing object
const config = require('./.conf.custom.js');
simplyConfig(config);

// JSDoc Type Definition for Intellisense support
/**
 * @type {import('./.conf.default.js')}
 */
const config = simplyConfig();

// Single line usage with Intellisense
/**
 * @type {import('./.conf.default.js')}
 */
const config = require('simply-config')();
```

## Options
Additional options can also be provided to the imported method
```js
const config = simplyConfig(null, {
  // High priority user provided overrides
  overrides: {
    category: {
      value: 'Always use this value';
    },
  },

  // User provided working directory
  workingDir: '/custom/working/directory',

  // Disable envar parsing
  disableEnvarParsing: true,
});
```

# Input Priority
There are four places this module will look for configuration values, in the following ascending priority order

## 1. Default Configurations
The base level input. Either provided directly by the user or found in a `.conf.default.js` file in the working directory. Configurations *must* be defined as a default configuration for overwrites to work (note: configuration values can be set to `null` or `undefined`)

## 2. Secret Configurations File
Values in a `.conf.js` file found in the working directory will overwrite default configurations

## 3. Environment Variables
Specially formatted environment variables can be used to define configuration values that will overwrite values found in configuration files. These envars should have the following format
```js
`conf_${categoryKey}_${valueKey}`
```

By default, JSON and numerical envars will automatically be parsed. Parsing can be disabled by setting the `disableEnvarParsing` options property to `true`

## 4. Overrides Option
Provide an options object with an `overrides` property to the imported method to overwrite any other values
