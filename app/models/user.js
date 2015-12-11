// Packages
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

// Schema
const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: true,
		match: /^[a-zA-Z]+[a-zA-Z0-9]{2,20}$/
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

// Statics

UserSchema.statics.viewModelFields = ['_id', 'username'];
UserSchema.statics.updateSafeFields = ['username', 'password'];

// Methods
UserSchema.methods.comparePassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

// Export model
module.exports = mongoose.model('User', UserSchema);
