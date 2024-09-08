const express = require('express');
const axios = require('axios');
const homeRouter = express.Router();
const { Client } = require('pg');

const { dummyData } = require('./dummyData.js');

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
client.connect();



homeRouter.get('/', async (req, res, next) => {
    try {
        const test = await axios.get(`https://evetycoon.com/api/v1/market/history/10000002/30375/`)

        for (let i = 0; i < test.data.length; i++) {
            const date = new Date(test.data[i].date);
            // console.log(date.toDateString());
        }
    }

    catch {
        res.status(500).send();
    }
})

module.exports = homeRouter;