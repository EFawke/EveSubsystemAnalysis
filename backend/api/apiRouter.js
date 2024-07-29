const express = require('express');
const apiRouter = express.Router();
const homeRouter = require('./homeRouter.js');
require('./matCostUpdater.js');
require('./marketDataUpdater.js');
require('./zkillUpdater.js');
require('./homePageUpdater.js');
const marketRouter = require('./marketRouter.js');

apiRouter.use('/home', homeRouter);
apiRouter.use('/market', marketRouter);

module.exports = apiRouter;