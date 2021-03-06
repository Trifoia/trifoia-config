'use strict';

/**
 * Default configuration file. Any values also present in the .conf.js file will be
 * overridden. The configurations have two layers
 * 1. Category
 * 2. Value
 * 
 * This system does not support nesting beyond these two layers. Any object value will
 * be replaced with the entire object value in the secret config
 * 
 * All values marked as `undefined` must be defined in the .conf.js file unless the
 * `config.errorOnUndefined` value is set to `false`
 * 
 * Environment variables can also be used to define values, using the following format for
 * the key: `conf_${category}_${value}`
 */
module.exports = {
  /**
   * Configuration configurations
   * 
   * This is a top level configuration category that includes values that
   * effect the function of the trifoia-config utility itself
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
