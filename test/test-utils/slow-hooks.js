'use strict';

const { isQuick } = require('../../utilities.js');

const originals = { it, before, beforeEach, after, afterEach };

const slowHooks = {
  it: Object.assign(async function (description, fn) {
    if (isQuick()) return it.skip(description, fn);
  
    return it(description, fn);
  }, it),
  before: Object.assign(async function (description, fn) {
    if (isQuick()) return;
  
    return before(description, fn);
  }, before),
  beforeEach: Object.assign(async function (description, fn) {
    if (isQuick()) return;
  
    return beforeEach(description, fn);
  }, beforeEach),
  after: Object.assign(async function (description, fn) {
    if (isQuick()) return;
  
    return after(description, fn);
  }, after),
  afterEach: Object.assign(async function (description, fn) {
    if (isQuick()) return;
  
    return afterEach(description, fn);
  }, afterEach),
};

slowHooks.force = {
  it: originals.it,
  before: originals.before,
  beforeEach: originals.beforeEach,
  after: originals.after,
  afterEach: originals.afterEach,
};

slowHooks.it.force = originals.it;
slowHooks.before.force = originals.before;
slowHooks.beforeEach.force = originals.beforeEach;
slowHooks.after.force = originals.after;
slowHooks.afterEach.force = originals.afterEach;

module.exports = slowHooks;
