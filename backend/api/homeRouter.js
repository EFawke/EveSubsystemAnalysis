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

let today;  // Declare variable at top-level

async function fetchToday() {
  try {
    let result = await client.query("SELECT DISTINCT date FROM price_data ORDER BY date DESC LIMIT 30;");
    console.log(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  }
}

// Fetch the date before starting the server/router
fetchToday().then(() => {
  today = Number(today);
  client.query(`SELECT * FROM price_data WHERE date = ${today};`).then((res) => {
    console.log(res.rows);
  })
});


module.exports = homeRouter;