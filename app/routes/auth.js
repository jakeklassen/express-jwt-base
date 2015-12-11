'use strict';

const _ = require('lodash');
const jsonWebToken = require('jsonwebtoken');
const wrap = require('wrap-fn');
const User = require('../models/user');

// Auth and generate JWT
exports.authenticate = (req, res, next) => {
	return wrap(function* (req, res, next) {
		try {
			let user = yield User.findOne({ username: req.body.username });

			if (!user) {
				return next(new Error('User not found'));
			}

			if (!user.comparePassword(req.body.password)) {
				return next(new Error('Passwords do not match'));
			}

			// Synchronous
			let token = jsonWebToken.sign(_.pick(user, User.viewModelFields),
				process.env.JWT_SECRET, { expiresIn: '24h' });

			res.json(token);
		} catch (err) {

		}
	})(req, res, next);
};
