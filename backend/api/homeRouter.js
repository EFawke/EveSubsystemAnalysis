// const express = require('express');
// const homeRouter = express.Router();
// const axios = require('axios');
// const { Client } = require('pg');

// let client;
// if (!process.env.DATABASE_URL) {
//     client = new Client({
//         user: 'tedfawke',
//         host: 'localhost',
//         database: 'evesubsystemanalysis_local',
//         password: '',
//         port: 5432
//     });
// } else {
//     client = new Client({
//         connectionString: process.env.DATABASE_URL,
//         ssl: { rejectUnauthorized: false },
//         allowExitOnIdle: true
//     });
// }
// client.connect();

// homeRouter.use(express.json());

// // Helper function to calculate the median of an array
// const calculateMedian = (arr) => {
//     const sorted = arr.slice().sort((a, b) => a - b);
//     const mid = Math.floor(sorted.length / 2);
//     return sorted.length % 2 !== 0
//         ? sorted[mid]
//         : (sorted[mid - 1] + sorted[mid]) / 2;
// };

// homeRouter.post('/', async (req, res) => {
//     const tradeHub = req.body.tradeHub;
//     try {
//         const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000); // One week ago in milliseconds

//         // Query to get the count of lost subsystems in the past week, ordered by count
//         const topLostSubsystems = await client.query(`
//             SELECT type_id, type_name, COUNT(*) AS loss_count
//             FROM subsystems
//             WHERE killtime >= $1
//             GROUP BY type_id, type_name
//             ORDER BY loss_count DESC
//             LIMIT 10;
//         `, [oneWeekAgo]);

//         const topSubsystems = topLostSubsystems.rows;
//         const priceDataResults = [];
//         const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

//         // Loop over each top subsystem to fetch the last 30 days' price data
//         for (const subsystem of topSubsystems) {
//             const { type_id, type_name } = subsystem;

//             const historicalPriceData = await client.query(`
//                 SELECT *
//                 FROM price_data
//                 WHERE type_id = $1
//                 AND region = '${tradeHub}'
//                 AND date >= $2
//                 ORDER BY date DESC;
//             `, [type_id, thirtyDaysAgo]);

//             const histData = historicalPriceData.rows;

//             const medianSell = calculateMedian(histData.map(row => row.minsell));
//             const medianBuy = calculateMedian(histData.map(row => row.maxbuy));
//             const medianSellVolume = calculateMedian(histData.map(row => row.sellvolume));
//             const medianBuyVolume = calculateMedian(histData.map(row => row.buyvolume));

//             const response = await axios.get(`https://evetycoon.com/api/v1/market/stats/${tradeHub}/${type_id}`);
//             const priceData = response.data;

//             const minSellPercentageChange = ((priceData.minSell - medianSell) / medianSell) * 100;
//             const minBuyPercentageChange = ((priceData.maxBuy - medianBuy) / medianBuy) * 100;
//             const minSellVolumePercentageChange = ((priceData.sellVolume - medianSellVolume) / medianSellVolume) * 100;
//             const minBuyVolumePercentageChange = ((priceData.buyVolume - medianBuyVolume) / medianBuyVolume) * 100;
//             // if (priceData.rows.length === 0) continue;

//             if(!priceData) continue;

//             priceDataResults.push({
//                 type_id,
//                 type_name,
//                 buy: priceData.maxBuy,
//                 sell: priceData.minSell,
//                 medianSell: medianSell,
//                 sellPercentageChange: minSellPercentageChange.toFixed(1),
//                 buyPercentageChange: minBuyPercentageChange.toFixed(1),
//                 sellVolumePercentageChange: minSellVolumePercentageChange.toFixed(1),
//                 buyVolumePercentageChange: minBuyVolumePercentageChange.toFixed(1),
//                 volRatio: Number(priceData.sellVolume / priceData.buyVolume).toFixed(1),
//                 buyVolume : priceData.buyVolume,
//                 sellVolume : priceData.sellVolume,
//                 losses: subsystem.loss_count,
//                 price_data: priceData,
//             });
//         }

//         //sort priceDataResults by sell
//         priceDataResults.sort((a, b) => b.sell - a.sell);

//         // Send the combined result as JSON
//         // console.log(priceDataResults);
//         res.json(priceDataResults);
//     } catch (error) {
//         console.error("Error fetching data:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// module.exports = homeRouter;


const express = require('express');
const homeRouter = express.Router();
const axios = require('axios');
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

homeRouter.use(express.json());

// Helper function to calculate the median of an array
const calculateMedian = (arr) => {
    const sorted = arr.slice().map(Number).sort((a, b) => a - b); // Ensure all elements are numbers
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
};

homeRouter.post('/', async (req, res) => {
    const tradeHub = req.body.tradeHub;
    try {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000); // One week ago in milliseconds

        // Query to get the count of lost subsystems in the past week, ordered by count
        const topLostSubsystems = await client.query(`
            SELECT type_id, type_name, COUNT(*) AS loss_count
            FROM subsystems
            WHERE killtime >= $1
            GROUP BY type_id, type_name
            ORDER BY loss_count DESC
            LIMIT 10;
        `,
        [oneWeekAgo]);

        const topSubsystems = topLostSubsystems.rows;
        const priceDataResults = [];
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        // Loop over each top subsystem to fetch the last 30 days' price data
        for (const subsystem of topSubsystems) {
            const { type_id, type_name } = subsystem;

            const historicalPriceData = await client.query(`
                SELECT *
                FROM price_data
                WHERE type_id = $1
                AND region = '${tradeHub}'
                AND date >= $2
                ORDER BY date DESC;
            `, [type_id, thirtyDaysAgo]);

            const histData = historicalPriceData.rows;

            const medianSell = calculateMedian(histData.map(row => Number(row.minsell)));
            const medianBuy = calculateMedian(histData.map(row => Number(row.maxbuy)));
            const medianSellVolume = calculateMedian(histData.map(row => Number(row.sellvolume)));
            const medianBuyVolume = calculateMedian(histData.map(row => Number(row.buyvolume)));

            const response = await axios.get(`https://evetycoon.com/api/v1/market/stats/${tradeHub}/${type_id}`);
            const priceData = response.data;

            const minSellPercentageChange = medianSell
                ? ((Number(priceData.minSell) - medianSell) / medianSell) * 100
                : 0;
            const minBuyPercentageChange = medianBuy
                ? ((Number(priceData.maxBuy) - medianBuy) / medianBuy) * 100
                : 0;
            const minSellVolumePercentageChange = medianSellVolume
                ? ((Number(priceData.sellVolume) - medianSellVolume) / medianSellVolume) * 100
                : 0;
            const minBuyVolumePercentageChange = medianBuyVolume
                ? ((Number(priceData.buyVolume) - medianBuyVolume) / medianBuyVolume) * 100
                : 0;

            if (!priceData) continue;

            priceDataResults.push({
                type_id,
                type_name,
                buy: Number(priceData.maxBuy),
                sell: Number(priceData.minSell),
                medianSell,
                sellPercentageChange: minSellPercentageChange.toFixed(1),
                buyPercentageChange: minBuyPercentageChange.toFixed(1),
                sellVolumePercentageChange: minSellVolumePercentageChange.toFixed(1),
                buyVolumePercentageChange: minBuyVolumePercentageChange.toFixed(1),
                volRatio: (Number(priceData.sellVolume) / Number(priceData.buyVolume)).toFixed(1),
                buyVolume: Number(priceData.buyVolume),
                sellVolume: Number(priceData.sellVolume),
                losses: Number(subsystem.loss_count),
                price_data: priceData,
            });
        }

        // Sort priceDataResults by sell
        priceDataResults.sort((a, b) => Number(b.sell) - Number(a.sell));

        // Send the combined result as JSON
        res.json(priceDataResults);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = homeRouter;
