const express = require('express');
const apiRouter = express.Router();

//cron jobs
require('../utils/updater.js');
require('../utils/zkillUpdater.js');

require('./dataSnapshotCron.js');

const homeRouter = require('./homeRouter.js');
const buildRouter = require('./buildRouter.js');
const subsystemRouter = require('./subsystemRouter.js');

apiRouter.use('/subsystem', subsystemRouter);
apiRouter.use('/home', homeRouter);
apiRouter.use('/build', buildRouter);

module.exports = apiRouter;