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
    client.query("SELECT * FROM home ORDER BY date DESC;")
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.send(dummyData);
        });
    
})

module.exports = homeRouter;