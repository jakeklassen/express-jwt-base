// Packages
require('dotenv').load();

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('express-jwt');
const log = require('./app/lib/log');
const routes = require('./app/routes');

const port = process.env.PORT || 3000;
const app = express();

// Connect to db
mongoose.connect(`mongodb://localhost:/${process.env.MONGO_LOCAL_DB}`);
mongoose.connection.once('open', () => {
	log.info(`Mongoose connection open at mongodb://localhost:/${process.env.MONGO_LOCAL_DB}`);
});

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

// Express log middleware
app.use(morgan('dev'));

app.get('/', (req, res, next) => {
	res.json({
		message: 'Try the /api/* routes...'
	});
});

const apiRouter = express.Router();

//==============//
// Guest Routes //
//==============//

apiRouter.post('/register', routes.api.register);
apiRouter.post('/authenticate', routes.api.authenticate);

// Guests can view users
apiRouter.get('/users', routes.api.users.all);

//======================//
// JWT Protected Routes //
//======================//

apiRouter.put('/users/:userId', jwt({ secret: process.env.JWT_SECRET }), routes.api.users.update);

// Error middleware
apiRouter.use((err, req, res, next) => {
	log.error(err);
	res.status(err.code || 500).json({
		error: err.message || err
	});
});

app.use('/api', apiRouter);

if (module.parent == null) {
	app.listen(port, function () {
		log.info(`Running on port ${port}`);
	});
} else {
	log.info('exporting app');
	exports.app = app;
}
