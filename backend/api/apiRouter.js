const express = require('express');
const apiRouter = express.Router();
const homeRouter = require('./homeRouter.js');
require('./matCostUpdater.js');
require('./marketDataUpdater.js');
require('./zkillUpdater.js');
require('./homePageUpdater.js');
const subsystemRouter = require('./subsystemRouter.js');
const marketRouter = require('./marketRouter.js');

apiRouter.use('/subsystem', subsystemRouter);
apiRouter.use('/home', homeRouter);
apiRouter.use('/market', marketRouter);

module.exports = apiRouter;