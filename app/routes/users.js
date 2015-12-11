'use strict';

const _ = require('lodash');
const wrap = require('wrap-fn');
const User = require('../models/user');

exports.all = (req, res, next) => {
	return wrap(function* (req, res, next) {
		res.json(yield User.find({}).select('-password').exec());
	})(req, res, next);
};

exports.update = (req, res, next) => {
	return wrap(function* (req, res, next) {
		try {
			let user = yield User.findByIdAndUpdate(req.params.userId,
				_.pick(req.body, User.updateSafeFields), { new: true });

			res.json(_.pick(user, User.viewModelFields));
		} catch(err) {
			return next(err);
		}
	})(req, res, next);
};
