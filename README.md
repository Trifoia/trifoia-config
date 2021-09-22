# Trifoia Nodejs Template
Nodejs template used by Trifoia. Remember to replace this with project specific information!
- This README file
- Package.json
  - name
  - version
  - description
  - repository.url
  - keywords
  - bugs.url
  - homepage

# Development Notes
## Node Version
Always use the version of Nodejs defined in the [.nvmrc]('./.nvmrc) file. It is _highly recommended_ that you use [NVM](https://github.com/nvm-sh/nvm) to manage Nodejs versions. To ensure you are using the correct Nodejs version, run the following command while within the root project directory:
```sh
nvm install ; nvm use
```

## NPM Scripts

```sh
npm test # Run all tests
npm run test-quick # Only run quick tests
npm run lint # Run the linter
npm run lint-fix # Run linter and automatically fix issues
```

## Project Structure
All code should be added to the [src](./src) directory. The structure of the source directory should be replicated in the [test](./test) directory, and all files except for control files should have an associated unit test file in that folder

## Unit Testing
This project uses the [Mocha](https://mochajs.org/) library to run unit tests. The principles of "Test Driven Development" should be followed when writing code in this project. That is, unit tests should be leveraged as a development tool and all major functionality should have associated unit tests

Test files should share the name of the file they are meant to test, with `-test` appended to the filename

### Slow Tests
There are two types of tests to consider, "quick" tests, and "slow" tests. For speedy development, finished tests that rely on external resources like a database or an aws service should be marked as "slow" - it will then be skipped over when running the `test-quick` commands. This can be done by using the hooks provided in the [slow-hooks](test/test-utils/slow-hooks.js) helper utility. If a test suite contains slow test, include the following snippet at the top of the file (with an adjusted require statement, if necessary):
```js
/* eslint-disable no-unused-vars */
const { it, before, beforeEach, after, afterEach } = require('../test-utils/slow-hooks.js');
/* eslint-enable no-unused-vars */
```

Once the slow hooks are imported, none of the tests or hooks will run when performing tests in quick mode. The import can be deactivated by either commenting out the import statement, or by appending `.force` to the end of the require statement, as follows:
```js
const { it, before, beforeEach, after, afterEach } = require('../test-utils/slow-hooks.js').force;
```

Additionally, if you still want a specific test or hook to always run, even when using slow hooks, append `.force` to the desired hook as follows:
```js
it.force('description', fn);
before.force('description', fn);
beforeEach.force('description', fn);
after.force('description', fn);
afterEach.force('description', fn);
```

## Debugging
This project has built-in utilities for debugging unit tests with VSCode (breakpoints, process stepping, etc). Run the `Mocha` or `Mocha Quick` debug launch configuration to debug all tests or only quick tests respectively

## Configuration
This project uses a standard configuration system that allows for global configuration values to be easily defined and overwritten locally. See the [config](./config.js) and [.conf.default.js](./.conf.default.js) files in the root directory for more information. Environment variables can also be used to define values, using the following format for the key: `NODE_CONF_${category}_${value}`
