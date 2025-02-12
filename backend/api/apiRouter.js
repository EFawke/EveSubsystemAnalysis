const express = require('express');
const apiRouter = express.Router();

require('./updater.js');

/* TEST UPDATER */
    // require('./updater_test.js'); //remove later!!
/* TEST UPDATER */

require('./zkillUpdater.js');

const homeRouter = require('./homeRouter.js');
const buildRouter = require('./buildRouter.js');
const subsystemRouter = require('./subsystemRouter.js');

apiRouter.use('/subsystem', subsystemRouter);
apiRouter.use('/home', homeRouter);
apiRouter.use('/build', buildRouter);

module.exports = apiRouter;