const axios = require('axios');
const { Client } = require('pg');
const { initialDatabaseUpdate } = require('../HistoricalDataUpdaters/initialDatabaseUpload.js');
const { updatePriceTable } = require('../DailyDataUpdaters/dailyDatabaseUpload.js');
const { backDate } = require('../DataBackdater-REMOVE_LATER/dataBackdater.js');

//remove later
// const { updatePriceData } = require('./databaseUpdaterOneTime.js');

let client;
if (!process.env.DATABASE_URL) {
    client = new Client({
        user: 'tedfawke',        // Your local PostgreSQL username
        host: 'localhost',       // Host should be localhost for local development
        database: 'evesubsystemanalysis_local',  // Your local database name
        password: '',            // Local password if needed (empty if not used)
        port: 5432               // Default PostgreSQL port
    });
} else {
    client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        allowExitOnIdle: true
    });
}

client.connect();

const dropTable = () => {
    client.query(`DROP TABLE IF EXISTS price_data;`)
        .then(() => {
            console.log('Dropped price_data');
        })
        .catch((err) => {
            console.log(err);
        })
}

// dropTable();

// updatePriceData();

//this has to store price data
//for every item (subsystem and materials)
//in every trade hub
const createPriceDataTable = () => {
    client.query(`CREATE TABLE IF NOT EXISTS "price_data" (
        id SERIAL PRIMARY KEY,
        date BIGINT,
        region BIGINT,
        type_id BIGINT,
        average_price NUMERIC,
        highest_price NUMERIC,
        lowest_price NUMERIC,
        order_count BIGINT,
        volume BIGINT,
        buyVolume BIGINT,
        sellVolume BIGINT,
        buyOrders BIGINT,
        sellOrders BIGINT,
        maxBuy BIGINT,
        minSell BIGINT);`)
        .then(() => {
            console.log('Created price_data');
        })
}

const createAnalysisSnapshotTable = () => {
    client.query(`
    CREATE TABLE IF NOT EXISTS esi_prices (
       type_id INTEGER PRIMARY KEY,
       adjusted_price NUMERIC,
       average_price NUMERIC,
       last_updated TIMESTAMP DEFAULT now()
     );`)
        .then(() => {
            console.log('Created esi_prices');
        });
}

createAnalysisSnapshotTable();

const logTable = () => {
    client.query(`SELECT * FROM price_data;`)
        .then((res) => {
            console.log(res.rows.length + ' rows in price_data');
            console.log(res.rows);
        })
}

// dropTable();
createPriceDataTable();

client.query(`SELECT * FROM price_data LIMIT 1;`)
    .then((res) => {
        if (res.rows.length === 0) {
            console.log("initializing price data");
            initialDatabaseUpdate(client);
        } else {
            console.log("price data has already been initialized");
        }
    })
    .catch((err) => {
        console.log(err);
    })

// i think this can be commented out now
// setInterval(() => {
//     backDate(client);
// }, 1000 * 60 * 60 * 24);

setInterval(() => {
    updatePriceTable(Date.now(), client);
}, 1000);

