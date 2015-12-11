'use strict';

// Logging helpers

const debug = require('debug');

exports.error = debug('app:error');

const info = debug('app:info');
info.log = console.log.bind(console);
exports.info = info;
