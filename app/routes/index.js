'use strict';

const guest = require('./guest');
const auth = require('./auth');
const users = require('./users');

exports.api = {
	register: guest.register,
	authenticate: auth.authenticate,
	users: users
};
