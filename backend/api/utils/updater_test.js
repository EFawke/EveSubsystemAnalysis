const axios = require('axios');
const { Client } = require('pg');
const { updatePriceTable } = require('../TestUpdater/dailyDatabaseUploadTest.js');

let client;
if (!process.env.DATABASE_URL) {
    client = new Client({
        user: process.env.LOCAL_USER,
        host: 'localhost',
        database: process.env.LOCAL_DB,
        password: '',
        port: process.env.LOCAL_PORT
    });
} else {
    client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
        allowExitOnIdle: true,
    });
}

client.connect();

setInterval(() => {
    updatePriceTable(Date.now(), client);
}, 1000);