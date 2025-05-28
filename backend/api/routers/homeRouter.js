const express = require('express');
const homeRouter = express.Router();
const { Client } = require('pg');

let client;
if (!process.env.DATABASE_URL) {
    client = new Client();
} else {
    client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        allowExitOnIdle: true
    });
}
client.connect();

homeRouter.use(express.json());

homeRouter.post('/', async (req, res) => {
    const tradeHub = req.body.tradeHub;

    if (!tradeHub) {
        return res.status(400).json({ error: "Missing tradeHub in request body" });
    }

    try {
        const { rows } = await client.query(`
            SELECT *
            FROM (
                SELECT *
                FROM home_snapshot
                WHERE region = $1
                AND date = (
                    SELECT MAX(date)
                    FROM home_snapshot
                    WHERE region = $1
                )
                ORDER BY losses DESC
                LIMIT 10
            ) AS top_lost
            ORDER BY min_sell DESC;
        `, [tradeHub]);

        res.json(rows);
    } catch (error) {
        console.error("Error fetching home snapshot:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = homeRouter;
