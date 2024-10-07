const express = require('express');
const matCostsRouter = express.Router();
const { Client } = require('pg');

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
client.connect()
    .catch(err => {
        console.log("client is down");
        console.log(err);
    })
    .then((res) => {
        console.log("client is connected");
    })

module.exports = matCostsRouter;