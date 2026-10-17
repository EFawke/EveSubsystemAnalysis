const cron = require('node-cron');
const { updateTradeVolumeSnapshotTable }  = require('../utils/analysisSnapshot.js');
const { updateHomeSnapshotTableCron } = require('./homeSnapshot.js');
const { fetchAndStorePrices } = require('./cachePrices.js');
const { buildSnapshot } = require('./buildSnapshot.js');

cron.schedule('*/30 * * * *', async () => {
    await buildSnapshot(); // cache mat price data
    await updateHomeSnapshotTableCron(); // gets all the values for the home page
    await updateTradeVolumeSnapshotTable(); // gets trade volume
    await fetchAndStorePrices(); //gets esi prices for build tax calculations
});