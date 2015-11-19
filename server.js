// Packages
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000;

// Models
const User = require('./app/models/user');

// Secret for JWT tokens
const superSecret = 'thisismysupersecrettokenohyea';

const app = express();
app.set('db', 'app-db');

// Connect to db
mongoose.connect(`mongodb://localhost:/${app.get('db')}`);

// Configure
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

// Allow CORS requests
app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

// Log requests
app.use(morgan('dev'));

// Routes
app.get('/', function (req, res) {
	res.send('Welcome to the homepage');
});

// Register route
app.route('/register')
	// Create new users
	.post(function (req, res, next) {
		const user = new User();
		user.name = req.body.name;
		user.email = req.body.email;
		user.password = req.body.password;

		user.save(function (err) {
			if (err) {
				// Error code refers to duplicate record in mongodb
				if (err.code === 11000) {
					return res.json({
						success: false,
						message: 'A user with that username already exists'
					});
				} else {
					return res.send(err);
				}
			}

			res.json({
				message: 'User created!'
			});
		});
	});

// Authenticate
app.post('/authenticate', function (req, res) {
	// Find user
	User.findOne({ email: req.body.email })
	.select('name email password -_id')
	.exec(function (err, user) {
		if (err) {
			console.log(err);
			throw err;
		}

		// No user with that email
		if (!user) {
			res.json({
				success: false,
				message: 'Authentication failed. User not found.'
			});
		} else if (user) {
			// Check if passwords match
			var validPassword = user.comparePassword(req.body.password);
			if (!validPassword) {
				res.json({
					success: false,
					message: 'Authentication failed. Wrong password.'
				});
			} else {
				// Create a JWT
				const token = jwt.sign({
					name: user.name,
					email: user.email
				}, superSecret, {
					expiresIn: '24h' // expires in 24 hours
				});

				// Return the information including token as JSON
				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
			}
		}
	});
});

// JWT Protected Routes //
//======================//

// Route to verify JWT
app.use(function (req, res, next) {
	// Check header or url parameters
	const token = req.body.token || req.query.token || req.headers['x-access-token'];

	// Decode token
	if (token) {
		// Verifies secret and checks expiry
		jwt.verify(token, superSecret, function (err, decoded) {
			if (err) {
				return res.json({
					success: false,
					message: 'Failed to authenticate token.'
				});
			} else {
				// If everything is good, save to request for use in other routes
				req.decoded = decoded;
				next();
			}
		});
	} else {
		// If there is no token, return an HTTP 403
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});
	}
});

app.listen(port, function () {
	console.log(`Running on port ${port}`);
});
