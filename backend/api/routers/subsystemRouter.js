const express = require('express');
const marketRouter = express.Router();
const { Client } = require('pg');
const { getSubsystemCosts, getProfits, getPriceData, calculateMedian } = require('../utils/getProfitsGraph.js');
const axios = require('axios');

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

marketRouter.use(express.json());

const getMatCosts = (costsData) => {
    const matCosts = {};
    matCosts.title = "Material costs";
    const dates = [];
    const dataValues = [];
    const thirtyDaysAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;

    const thirtyDaysCosts = [];
    matCosts.currentValue = Number(costsData[0].totalCost).toFixed(2);

    for (let i = 0; i < costsData.length; i++) {
        dates.push(costsData[i].date);
        dataValues.push(Number(costsData[i].totalCost).toFixed(2));
        if (costsData[i].date > thirtyDaysAgo) {
            thirtyDaysCosts.push(costsData[i].totalCost);
        }
    }

    const thirtyDayMedian = calculateMedian(thirtyDaysCosts);
    const matCostPercentageChange = thirtyDayMedian
        ? ((Number(matCosts.currentValue) - thirtyDayMedian) / thirtyDayMedian) * 100
        : 0;
    matCosts.thirtyDayMedianDelta = Number(matCostPercentageChange).toFixed(1);
    matCosts.dates = dates;
    matCosts.dataValues = dataValues;

    return matCosts;
};

const getBuyVolume = (latestData, historicalData) => {
    const buyVolume = {};
    buyVolume.title = "Buy volume";
    let currentVolume;
    if (!latestData) {
        currentVolume = historicalData[0].buyvolume;
    } else {
        currentVolume = latestData.buy_volume;
    }
    buyVolume.currentValue = currentVolume;

    buyVolume.thirtyDayMedianDelta = latestData.buy_volume_percent;
    const dates = [];
    const dataValues = [];
    for (let i = 0; i < historicalData.length; i++) {
        dates.push(historicalData[i].date);
        dataValues.push(historicalData[i].buyvolume);
    }
    buyVolume.dates = dates;
    buyVolume.dataValues = dataValues;
    return buyVolume;
};

const getSellVolume = (latestData, historicalData) => {
    const sellVolume = {};
    sellVolume.title = "Sell volume";
    let currentVolume;
    if (!latestData) {
        currentVolume = historicalData[0].sellvolume;
    } else {
        currentVolume = latestData.sell_volume;
    }
    sellVolume.currentValue = currentVolume;
    sellVolume.thirtyDayMedianDelta = latestData.sell_volume_percent;
    const dates = [];
    const dataValues = [];
    for (let i = 0; i < historicalData.length; i++) {
        dates.push(historicalData[i].date);
        dataValues.push(historicalData[i].sellvolume);
    }
    sellVolume.dates = dates;
    sellVolume.dataValues = dataValues;
    return sellVolume;
};

const getMinSell = (latestData, historicalData) => {
    const minSell = {};
    minSell.title = "Min sell";
    let currentVolume;
    if (!latestData) {
        currentVolume = historicalData[0].minsell;
    } else {
        currentVolume = latestData.min_sell;
    }
    minSell.currentValue = currentVolume;
    minSell.thirtyDayMedianDelta = latestData.min_sell_percent;
    const dates = [];
    const dataValues = [];
    for (let i = 0; i < historicalData.length; i++) {
        dates.push(historicalData[i].date);
        dataValues.push(historicalData[i].minsell);
    }
    minSell.dates = dates;
    minSell.dataValues = dataValues;
    return minSell;
};

const getMaxBuy = (latestData, historicalData) => {
    const maxBuy = {};
    maxBuy.title = "Max buy";
    let currentVolume;
    if (!latestData) {
        currentVolume = historicalData[0].maxbuy;
    } else {
        currentVolume = latestData.max_buy;
    }
    maxBuy.currentValue = currentVolume;
    maxBuy.thirtyDayMedianDelta = latestData.max_buy_percent;
    const dates = [];
    const dataValues = [];
    for (let i = 0; i < historicalData.length; i++) {
        dates.push(historicalData[i].date);
        dataValues.push(historicalData[i].maxbuy);
    }
    maxBuy.dates = dates;
    maxBuy.dataValues = dataValues;
    return maxBuy;
};

const getTradeVolume = (historicalData) => {
    const tradeVolume = {};
    tradeVolume.title = "Trade volume";
    const dates = [];
    const dataValues = [];
    let currentVolume = historicalData[0].trade_volume || 0;
    for (let i = 0; i < historicalData.length; i++) {
        const date = historicalData[i].date;
        dates.push(date);
        dataValues.push(historicalData[i].trade_volume);
    }
    tradeVolume.currentValue = currentVolume;
    const tradeVolumePercentageChange = historicalData[0].trade_volume_percent || 0;
    tradeVolume.thirtyDayMedianDelta = tradeVolumePercentageChange;
    tradeVolume.dates = dates;
    tradeVolume.dataValues = dataValues;

    return tradeVolume;
};

function getLossesData(subsystems) {
    const losses = {
        currentValue: 0,
        title: "Losses",
        thirtyDayMedianDelta: 0,
        dates: [],
        dataValues: []
    };

    if (!Array.isArray(subsystems) || subsystems.length === 0) {
        return losses;
    }

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneDayAgo = now - oneDayMs;

    // Convert killtime to numbers and sort chronologically
    const sortedSubsystems = subsystems.map(s => ({
        ...s,
        killtime: Number(s.killtime)
    })).sort((a, b) => a.killtime - b.killtime);

    // Filter last 24 hours
    losses.currentValue = sortedSubsystems.filter(s => s.killtime >= oneDayAgo).length;

    // Generate date range
    const firstLossTime = sortedSubsystems[0].killtime;
    const startDate = new Date(firstLossTime).setUTCHours(0, 0, 0, 0);
    const endDate = new Date(now).setUTCHours(0, 0, 0, 0);

    for (let day = startDate; day <= endDate; day += oneDayMs) {
        losses.dates.push(day);
        const dayStart = day;
        const dayEnd = day + oneDayMs;

        const dailyCount = sortedSubsystems.filter(s => s.killtime >= dayStart && s.killtime < dayEnd).length;
        losses.dataValues.push(dailyCount);
    }

    // Calculate 30-day median delta
    const last30Days = losses.dataValues.slice(-30);
    const sorted30Days = [...last30Days].sort((a, b) => a - b);
    let median = 0;
    if (sorted30Days.length > 0) {
        const mid = Math.floor(sorted30Days.length / 2);
        median = sorted30Days.length % 2 !== 0 ? sorted30Days[mid] : (sorted30Days[mid - 1] + sorted30Days[mid]) / 2;
    }

    if (median > 0) {
        losses.thirtyDayMedianDelta = (((losses.currentValue - median) / median) * 100).toFixed(1);
    }

    return losses;
};

marketRouter.post(`/:subsystemID`, async (req, res) => {
    const id = req.params.subsystemID;
    const settings = req.body;
    const time = new Date().getTime();
    const twentyfourhours = 24 * 60 * 60 * 1000
    const yesterday = time - twentyfourhours;
    const oneYearAgo = time - (twentyfourhours * 364);
    // const oneYearAgo = Math.floor(new Date().setFullYear(new Date().getFullYear() - 1));
    Promise.all([
        client.query(`SELECT * FROM subsystems WHERE type_id = ${id} AND killtime > ${oneYearAgo} ORDER BY killtime DESC;`),
        client.query(`
            SELECT DISTINCT ON (date) date, minsell, maxbuy, buyvolume, sellvolume 
            FROM price_data 
            WHERE type_id = ${id} 
              AND region = '${settings.subsystemsLocation}' 
              AND date > '${oneYearAgo}' 
            ORDER BY date DESC;`),
        getSubsystemCosts(settings, oneYearAgo),
        client.query(`SELECT * FROM analysis_snapshot WHERE type_id = ${id} AND region = '${settings.subsystemsLocation}' ORDER BY date DESC;`),
        client.query(`SELECT * FROM subsystems WHERE type_id = ${id} AND killtime > ${yesterday};`),
        client.query(`SELECT * FROM home_snapshot WHERE type_id = ${id} AND region = ${settings.subsystemsLocation} ORDER BY date DESC;`)
    ])
        .then(data => {
            const subsystems = data[0].rows;
            const costsData = data[2];
            const marketDataCurrent = data[5].rows[0];
            const minSell = getMinSell(marketDataCurrent, data[1].rows);
            const maxBuy = getMaxBuy(marketDataCurrent, data[1].rows);
            const matCosts = getMatCosts(costsData);

            let profit = null;
            if (settings.subsystemsOrderType == 'buy') {
                profit = getProfits(matCosts, maxBuy);
            }
            if (settings.subsystemsOrderType == 'sell') {
                profit = getProfits(matCosts, minSell);
            }
            const buyVolume = getBuyVolume(marketDataCurrent, data[1].rows);
            const sellVolume = getSellVolume(marketDataCurrent, data[1].rows);
            const tradeVolume = getTradeVolume(data[3].rows);
            const lossesData = getLossesData(subsystems);
            res.status(200).json({ minSell, maxBuy, matCosts, profit, buyVolume, sellVolume, tradeVolume, lossesData });
        })
});

module.exports = marketRouter;