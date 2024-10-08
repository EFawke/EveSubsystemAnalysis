const express = require('express');
const axios = require('axios');
const homeRouter = express.Router();
const { Client } = require('pg');
const { namesAndIds, subsystemIDArr } = require('./namesAndIds.js');

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

let today = Date.now();  // Declare variable at top-level
let todayDate = new Date(today);
todayDate.setHours(0, 0, 0, 0);
today = todayDate.getTime();

console.log(today);

async function fetchToday() {
  try {
    let result = await client.query("SELECT DISTINCT date FROM price_data ORDER BY date DESC LIMIT 1;");
    console.log(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  }
}

fetchToday();


module.exports = homeRouter;