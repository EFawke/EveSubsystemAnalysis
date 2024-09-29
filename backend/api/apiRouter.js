const express = require('express');
const apiRouter = express.Router();

require('./updater.js');

const homeRouter = require('./homeRouter.js');
const subsystemRouter = require('./subsystemRouter.js');

apiRouter.use('/subsystem', subsystemRouter);
apiRouter.use('/home', homeRouter);

module.exports = apiRouter;