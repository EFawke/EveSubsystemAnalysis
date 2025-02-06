const axios = require('axios');
const { Client } = require('pg');
const { updatePriceTable } = require('./TestUpdater/dailyDatabaseUploadTest.js');

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

setInterval(() => {
    updatePriceTable(Date.now(), client);
}, 1000);