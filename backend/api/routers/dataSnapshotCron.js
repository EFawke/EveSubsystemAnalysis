const cron = require('node-cron');
const { updateTradeVolumeSnapshotTable }  = require('../utils/analysisSnapshot.js');
const { updateHomeSnapshotTableCron } = require('./homeSnapshot.js');
const { fetchAndStorePrices } = require('./cachePrices.js');
const { buildSnapshot } = require('./buildSnapshot.js');

const runFunc = async () => {
    await buildSnapshot();
}

runFunc();

cron.schedule('*/10 * * * *', async () => {
    await buildSnapshot();
    await updateHomeSnapshotTableCron(); // gets all the values for the home page
    await updateTradeVolumeSnapshotTable(); // gets trade volume
    await fetchAndStorePrices(); //gets esi prices for build tax calculations
});