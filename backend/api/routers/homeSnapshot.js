const cron = require('node-cron');
const axios = require('axios');
const { Client } = require('pg');
const { namesAndIds, materialsNamesAndIds } = require('../utils/namesAndIds.js');

let client;
if (!process.env.DATABASE_URL) {
    client = new Client();
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

const dropTable = () => {
    client.query(`DROP TABLE IF EXISTS home_snapshot;`)
        .then(() => {
            console.log('Dropped home_snapshot');
        })
        .catch((err) => {
            console.log(err);
        })
}

// dropTable();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const createHomeSnapshotTable = () => {
    client.query(`CREATE TABLE IF NOT EXISTS "home_snapshot" (
        id SERIAL PRIMARY KEY,
        date BIGINT,
        region BIGINT,
        region_name VARCHAR,
        type_id BIGINT,
        item_name VARCHAR,
        min_sell NUMERIC,
        min_sell_percent NUMERIC,
        max_buy NUMERIC,
        max_buy_percent NUMERIC,
        buy_volume BIGINT,
        buy_volume_percent NUMERIC,
        sell_volume BIGINT,
        sell_volume_percent NUMERIC,
        losses BIGINT,
        losses_percent NUMERIC
        );`)
        .then(() => {
            console.log('Created home_snapshot');
        })
}

createHomeSnapshotTable()

const calculateMedian = (arr) => {
    const sorted = arr.slice().map(Number).sort((a, b) => a - b); // Ensure all elements are numbers
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
};

function getLowestSellOrderPrice(orders) {
    const sellOrders = orders.filter(order => !order.is_buy_order);
    return sellOrders.reduce((lowest, order) => {
        return order.price < lowest ? order.price : lowest;
    }, Infinity);
}

function getHighestBuyOrderPrice(orders) {
    const buyOrders = orders.filter(order => order.is_buy_order);
    return buyOrders.reduce((highest, order) => {
        return order.price > highest ? order.price : highest;
    }, -Infinity);
}

function getSellVolume(orders) {
    return orders
        .filter(order => !order.is_buy_order)
        .reduce((totalVolume, order) => totalVolume + order.volume_remain, 0);
}

function getBuyVolume(orders) {
    return orders
        .filter(order => order.is_buy_order)
        .reduce((totalVolume, order) => totalVolume + order.volume_remain, 0);
}

function getRegionName(regionId) {
    const regionMap = {
        '10000002': 'Jita',
        '10000043': 'Amarr',
        '10000030': 'Rens',
        '10000042': 'Hek',
        '10000032': 'Dodixie'
    };
    return regionMap[regionId] || 'Unknown';
}

const updateHomeSnapshotTable = async (region, date) => {
    const tradeHub = region;
    try {
        const oneWeekAgo = date - (7 * 24 * 60 * 60 * 1000); // One week ago in milliseconds
        const twoWeeksAgo = date - (14 * 24 * 60 * 60 * 1000);

        const subsystems = namesAndIds;

        // This week
        const thisWeekLosses = await client.query(`
            SELECT type_id, COUNT(*) AS loss_count
            FROM subsystems
            WHERE killtime >= $1
            GROUP BY type_id;
            `, [oneWeekAgo]);

        const thisWeekLossMap = Object.fromEntries(
            thisWeekLosses.rows.map(row => [row.type_id, Number(row.loss_count)])
        );

        // Last week
        const lastWeekLosses = await client.query(`
            SELECT type_id, COUNT(*) AS loss_count
            FROM subsystems
            WHERE killtime >= $1 AND killtime < $2
            GROUP BY type_id;
            `, [twoWeeksAgo, oneWeekAgo]);

        const lastWeekLossMap = Object.fromEntries(
            lastWeekLosses.rows.map(row => [row.type_id, Number(row.loss_count)])
        );

        const priceDataResults = [];
        const thirtyDaysAgo = date - (30 * 24 * 60 * 60 * 1000);

        // Loop over each top subsystem to fetch the last 30 days' price data
        for (const subsystem of subsystems) {
            const { id, name } = subsystem;

            const currentLosses = thisWeekLossMap[id] || 0;
            const previousLosses = lastWeekLossMap[id] || 0;

            let lossesPercentChange;

            if (previousLosses > 0) {
                lossesPercentChange = ((currentLosses - previousLosses) / previousLosses) * 100;
            } else if (currentLosses > 0) {
                lossesPercentChange = 100;
            } else {
                lossesPercentChange = 0;
            }


            const historicalPriceData = await client.query(`
                SELECT *
                FROM price_data
                WHERE type_id = $1
                AND region = '${tradeHub}'
                AND date >= $2
                ORDER BY date DESC;
            `, [id, thirtyDaysAgo]);

            const histData = historicalPriceData.rows;

            const medianSell = calculateMedian(histData.map(row => Number(row.minsell)));
            const medianBuy = calculateMedian(histData.map(row => Number(row.maxbuy)));
            const medianSellVolume = calculateMedian(histData.map(row => Number(row.sellvolume)));
            const medianBuyVolume = calculateMedian(histData.map(row => Number(row.buyvolume)));

            let response;
            await delay(200) // Delay to avoid hitting ESI rate limits
            try {
                response = await axios.get(`https://esi.evetech.net/latest/markets/${tradeHub}/orders/?type_id=${id}`);
            } catch (err) {
                console.warn(`Failed to fetch ESI market data for type_id ${id}: ${err.message}`);
                response = undefined;
            }


            const priceData = {};

            priceData.minSell = !response?.data ? histData[0].minsell : getLowestSellOrderPrice(response.data);
            priceData.maxBuy = !response?.data ? histData[0].maxbuy : getHighestBuyOrderPrice(response.data);
            priceData.sellVolume = !response?.data ? histData[0].sellvolume : getSellVolume(response.data);
            priceData.buyVolume = !response?.data ? histData[0].buyvolume : getBuyVolume(response.data);


            const minSellPercentageChange = medianSell
                ? ((Number(priceData.minSell) - medianSell) / medianSell) * 100
                : 0;
            const minBuyPercentageChange = medianBuy
                ? ((Number(priceData.maxBuy) - medianBuy) / medianBuy) * 100
                : 0;
            const sellVolumePercentageChange = medianSellVolume
                ? ((Number(priceData.sellVolume) - medianSellVolume) / medianSellVolume) * 100
                : 0;
            const buyVolumePercentageChange = medianBuyVolume
                ? ((Number(priceData.buyVolume) - medianBuyVolume) / medianBuyVolume) * 100
                : 0;

            if (!priceData) continue;

            priceDataResults.push({
                id,
                name,
                maxBuy: Number(priceData.maxBuy),
                minSell: Number(priceData.minSell),
                medianSell,
                sellPercentageChange: minSellPercentageChange.toFixed(1),
                buyPercentageChange: minBuyPercentageChange.toFixed(1),
                sellVolumePercentageChange: sellVolumePercentageChange.toFixed(1),
                buyVolumePercentageChange: buyVolumePercentageChange.toFixed(1),
                buyVolume: Number(priceData.buyVolume),
                sellVolume: Number(priceData.sellVolume),
                price_data: priceData,
                losses: currentLosses,
                lossesPercent: lossesPercentChange.toFixed(1),
            });
        }

        // Sort priceDataResults by sell
        priceDataResults.sort((a, b) => Number(b.sell) - Number(a.sell));

        // add the data to the database
        for (const entry of priceDataResults) {
            await client.query(`
                INSERT INTO home_snapshot (
                    date, region, region_name, type_id, item_name,
                    min_sell, min_sell_percent, max_buy, max_buy_percent,
                    buy_volume, buy_volume_percent, sell_volume, sell_volume_percent,
                    losses, losses_percent
                ) VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9,
                    $10, $11, $12, $13,
                    $14, $15
                )
            `, [
                date,
                Number(region),
                getRegionName(region),
                entry.id,
                entry.name,
                entry.minSell,
                Number(entry.sellPercentageChange),
                entry.maxBuy,
                Number(entry.buyPercentageChange),
                entry.buyVolume,
                Number(entry.buyVolumePercentageChange),
                entry.sellVolume,
                Number(entry.sellVolumePercentageChange),
                entry.losses,
                Number(entry.lossesPercent)
            ]);
        }

        // Keep only the most recent snapshot per region
        await client.query(`
            DELETE FROM home_snapshot
            WHERE (region, date) NOT IN (
                SELECT region, MAX(date)
                FROM home_snapshot
                GROUP BY region
            );
        `);
        // console.log(priceDataResults)
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

const updateHomeSnapshotTableCron = async () => {
    const date = Date.now();
    const regions = ['10000002', '10000043', '10000030', '10000042', '10000032'];

    for (const region of regions) {
        await updateHomeSnapshotTable(region, date);
    }
}

module.exports = {
    updateHomeSnapshotTableCron
};