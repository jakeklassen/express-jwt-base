'use strict';

const _ = require('lodash');
const wrap = require('wrap-fn');
const User = require('../models/user');

// Register a new user
exports.register = (req, res, next) => {
	return wrap(function* (req, res, next) {
		try {
			let user = yield User.create(req.body);
			res.status(201).json(_.pick(user, User.viewModelFields));
		} catch (err) {
			// Mongoose duplicate user error
			if (err.code == 11000) {
				return next(new Error('username already taken'))
			}

			return next(err);
		}
	})(req, res, next);
};
