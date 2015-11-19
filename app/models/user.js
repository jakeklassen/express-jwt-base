// Packages
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

// Schema
const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},

	email: {
		type: String,
		unique: true,
		required: true
	},

	password: {
		type: String,
		required: true
	}
});

// Hooks
UserSchema.pre('save', function (next) {
	const user = this;

	// If user is new or password was updated
	if (!user.isModified('password')) return next();

	// Generate hash
	bcrypt.hash(user.password, null, null, function (err, hash) {
		if (err) return next(err);

		// Change the password to hashed version
		user.password = hash;
		next();
	});
});

// Methods
UserSchema.methods.comparePassword = function (password) {
	const user = this;
	return bcrypt.compareSync(password, user.password);
};

// Export model
module.exports = mongoose.model('User', UserSchema);
