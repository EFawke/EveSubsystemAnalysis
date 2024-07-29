const express = require('express');
const matCostsRouter = express.Router();
const { Client } = require('pg');

let client;
if (!process.env.DATABASE_URL) {
    client = new Client()
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