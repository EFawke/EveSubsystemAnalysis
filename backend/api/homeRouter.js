const express = require('express');
const homeRouter = express.Router();
const { Client } = require('pg');

let client;
if (!process.env.DATABASE_URL) {
    client = new Client({
        user: 'tedfawke',
        host: 'localhost',
        database: 'evesubsystemanalysis_local',
        password: '',
        port: 5432
    });
} else {
    client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        allowExitOnIdle: true
    });
}
client.connect();

// Helper function to calculate the median of an array
const calculateMedian = (arr) => {
    const sorted = arr.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
};

homeRouter.get('/', async (req, res) => {
    try {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000); // One week ago in milliseconds

        // Query to get the count of lost subsystems in the past week, ordered by count
        const topLostSubsystems = await client.query(`
            SELECT type_id, type_name, COUNT(*) AS loss_count
            FROM subsystems
            WHERE killtime >= $1
            GROUP BY type_id, type_name
            ORDER BY loss_count DESC;
        `, [oneWeekAgo]);

        const topSubsystems = topLostSubsystems.rows;
        const priceDataResults = [];
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        // Loop over each top subsystem to fetch the last 30 days' price data
        for (const subsystem of topSubsystems) {
            const { type_id, type_name } = subsystem;

            const priceData = await client.query(`
                SELECT *
                FROM price_data
                WHERE type_id = $1
                AND region = '10000002'
                AND date >= $2
                ORDER BY date DESC;
            `, [type_id, thirtyDaysAgo]);

            if (priceData.rows.length === 0) continue;

            // Calculate daily percentage changes for maxBuy, minSell, and sellBuyRatio
            const maxBuyPercentageChanges = [];
            const minSellPercentageChanges = [];
            const sellBuyRatioPercentageChanges = [];

            for (let i = 1; i < priceData.rows.length; i++) {
                const prev = priceData.rows[i - 1];
                const curr = priceData.rows[i];

                // Calculate percentage change for maxBuy
                const maxBuyChange = ((curr.maxbuy - prev.maxbuy) / prev.maxbuy) * 100;
                maxBuyPercentageChanges.push(Math.abs(maxBuyChange));

                // Calculate percentage change for minSell
                const minSellChange = ((curr.minsell - prev.minsell) / prev.minsell) * 100;
                minSellPercentageChanges.push(Math.abs(minSellChange));

                // Calculate percentage change for sellBuyRatio
                const currRatio = curr.sellvolume && curr.buyvolume
                    ? curr.sellvolume / curr.buyvolume
                    : 0;
                const prevRatio = prev.sellvolume && prev.buyvolume
                    ? prev.sellvolume / prev.buyvolume
                    : 0;
                const ratioChange = ((currRatio - prevRatio) / (prevRatio || 1)) * 100;
                sellBuyRatioPercentageChanges.push(Math.abs(ratioChange));
            }

            // Calculate the median of absolute percentage changes for each metric
            const medianMaxBuyDeltaPercentage = calculateMedian(maxBuyPercentageChanges).toFixed(2);
            const medianMinSellDeltaPercentage = calculateMedian(minSellPercentageChanges).toFixed(2);
            const medianSellBuyRatioDeltaPercentage = calculateMedian(sellBuyRatioPercentageChanges).toFixed(2);

            priceDataResults.push({
                type_id,
                type_name,
                buy: priceData.rows[0].maxbuy,
                sell: priceData.rows[0].minsell,
                volRatio: Number(priceData.rows[0].sellvolume / priceData.rows[0].buyvolume).toFixed(2),
                buyVolume : priceData.rows[0].buyvolume,
                sellVolume : priceData.rows[0].sellvolume,
                losses: subsystem.loss_count,
                price_data: priceData.rows,
                medianMaxBuyDeltaPercentage: `${medianMaxBuyDeltaPercentage}%`,
                medianMinSellDeltaPercentage: `${medianMinSellDeltaPercentage}%`,
            });
        }

        //sort priceDataResults by sell
        priceDataResults.sort((a, b) => b.sell - a.sell);

        // Send the combined result as JSON
        // console.log(priceDataResults);
        res.json(priceDataResults);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = homeRouter;
