const express = require('express');
const marketRouter = express.Router();
const { Client } = require('pg');
const { getSubsystemCosts, getProfits, getPriceData, calculateMedian } = require('../utils/getProfitsGraph.js');
const axios = require('axios');

let client;
if (!process.env.DATABASE_URL) {
    client = new Client({
        user: process.env.LOCAL_USER,
        host: 'localhost',
        database: process.env.LOCAL_DB,
        password: '',
        port: process.env.LOCAL_PORT
    });
} else {
    client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
        allowExitOnIdle: true,
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
    let startDate = new Date(firstLossTime).setUTCHours(0, 0, 0, 0);
    const endDate = new Date(now).setUTCHours(0, 0, 0, 0);

    const thirtyDayStop = now - oneDayMs * 30;

    for (let day = startDate; day <= endDate; day += oneDayMs) {
        if(day < thirtyDayStop){
            continue;
        }
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
    const id = Number(req.params.subsystemID);
    const settings = req.body;
    const time = new Date().setUTCHours(0, 0, 0, 0);
    const twentyfourhours = 24 * 60 * 60 * 1000
    let dates = [];
    for(let i = 0; i < 30; i++){
        dates.push(time - (twentyfourhours * i));
    }

    // console.log(settings);

    const lossesQuery = `
    SELECT to_char(to_timestamp(killtime / 1000) AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
           count(*)::integer AS count
    FROM subsystems
    WHERE killtime >= $1 AND type_id = $2
    GROUP BY day
    ORDER BY day ASC;`;
    const pricesQuery = `
    SELECT DISTINCT ON (day)
           to_char(to_timestamp(date / 1000) AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
           minsell::integer, maxbuy::integer, buyvolume::integer, sellvolume::integer
    FROM price_data
    WHERE type_id = $1 AND region = $2 AND date >= $3
    ORDER BY day ASC, date DESC;`;
    const tradeVolQuery = `
    SELECT DISTINCT ON (day)
           to_char(to_timestamp(date / 1000) AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
           trade_volume::integer
    FROM analysis_snapshot
    WHERE type_id = $1 AND region = $2 AND date >= $3
    ORDER BY day ASC, date DESC;`;

    let losses = await client.query(lossesQuery, [[...dates].at(-1), id]);
    let prices = await client.query(pricesQuery, [id, settings.subsystemsLocation, [...dates].at(-1)]);
    let tradeVol = await client.query(tradeVolQuery, [id, settings.subsystemsLocation, [...dates].at(-1)]);
    const costs = await getSubsystemCosts(settings, [...dates].at(-1))

    losses = losses?.rows;
    prices = prices?.rows;
    tradeVol = tradeVol?.rows;

    let chartData = [];

    let sortedDates = [...dates].reverse();

    for(let i = 0; i < sortedDates.length; i++){
        const day = new Date(sortedDates[i]).toISOString().split('T')[0]
        const obj = {
            day: day,
            tradeVol: tradeVol.find((index) => index.day === day)?.trade_volume || 'No Data',
            totalCost: Number(costs.find((index) => index.day === day)?.totalCost?.toFixed(0)) || 'No Data',
            minSell: prices.find((index) => index.day === day)?.minsell || 'No Data',
            maxBuy: prices.find((index) => index.day === day)?.maxbuy || 'No Data',
            buyVol: prices.find((index) => index.day === day)?.buyvolume || 'No Data',
            sellVol: prices.find((index) => index.day === day)?.sellvolume || 'No Data',
            losses: losses.find((index) => index.day === day)?.count || 'No Data',
            profit: !costs.find((index) => index.day === day)?.totalCost || !prices.find((index) => index.day === day)?.maxbuy || !prices.find((index) => index.day === day)?.minsell ? 'No Data' : settings.subsystemsOrderType === 'sell' ? prices.find((index) => index.day === day).minsell - Number(costs.find((index) => index.day === day).totalCost.toFixed(0)) : prices.find((index) => index.day === day).maxbuy - Number(costs.find((index) => index.day === day).totalCost.toFixed(0))
        }
        chartData.push(obj)
    }

    let currentValues = {
        tradeVol: {
            currentValue: chartData.filter((item) => item.tradeVol !== 'No Data').at(-1).tradeVol,
            change: (() => {
                const current = chartData.filter((item) => item.tradeVol !== 'No Data').at(-1).tradeVol;
                const cleaned = chartData.filter((item) => item.tradeVol !== 'No Data').sort((a,b) => a.tradeVol - b.tradeVol);
                const middle = Math.floor(cleaned.length  / 2);
                return Number((((current - cleaned[middle].tradeVol) / cleaned[middle].tradeVol) * 100).toFixed(1))
            })()
        },
        totalCost: {
            currentValue: [...chartData].filter((item) => item.totalCost !== 'No Data').at(-1).totalCost,
            change: (() => {
                const current = chartData.filter((item) => item.totalCost !== 'No Data').at(-1).totalCost;
                const cleaned = chartData.filter((item) => item.totalCost !== 'No Data').sort((a,b) => a.totalCost - b.totalCost);
                const middle = Math.floor(cleaned.length  / 2);
                return Number((((current - cleaned[middle].totalCost) / cleaned[middle].totalCost) * 100).toFixed(1))
            })()
        },
        minSell: {
            currentValue: [...chartData].filter((item) => item.minSell !== 'No Data').at(-1).minSell,
            change: (() => {
                const current = chartData.filter((item) => item.minSell !== 'No Data').at(-1).minSell;
                const cleaned = chartData.filter((item) => item.minSell !== 'No Data').sort((a,b) => a.minSell - b.minSell);
                const middle = Math.floor(cleaned.length  / 2);
                return Number((((current - cleaned[middle].minSell) / cleaned[middle].minSell) * 100).toFixed(1))
            })()
        },
        maxBuy: {
            currentValue: [...chartData].filter((item) => item.maxBuy !== 'No Data').at(-1).maxBuy,
            change: (() => {
                const current = chartData.filter((item) => item.maxBuy !== 'No Data').at(-1).maxBuy;
                const cleaned = chartData.filter((item) => item.maxBuy !== 'No Data').sort((a,b) => a.maxBuy - b.maxBuy);
                const middle = Math.floor(cleaned.length  / 2);
                return Number((((current - cleaned[middle].maxBuy) / cleaned[middle].maxBuy) * 100).toFixed(1))
            })()
        },
        buyVol: {
            currentValue: [...chartData].filter((item) => item.buyVol !== 'No Data').at(-1).buyVol,
            change: (() => {
                const current = chartData.filter((item) => item.buyVol !== 'No Data').at(-1).buyVol;
                const cleaned = chartData.filter((item) => item.buyVol !== 'No Data').sort((a,b) => a.buyVol - b.buyVol);
                const middle = Math.floor(cleaned.length  / 2);
                return Number((((current - cleaned[middle].buyVol) / cleaned[middle].buyVol) * 100).toFixed(1))
            })()
        },
        sellVol: {
            currentValue: [...chartData].filter((item) => item.sellVol !== 'No Data').at(-1).sellVol,
            change: (() => {
                const current = chartData.filter((item) => item.sellVol !== 'No Data').at(-1).sellVol;
                const cleaned = chartData.filter((item) => item.sellVol !== 'No Data').sort((a,b) => a.sellVol - b.sellVol);
                const middle = Math.floor(cleaned.length  / 2);
                return Number((((current - cleaned[middle].sellVol) / cleaned[middle].sellVol) * 100).toFixed(1))
            })()
        },
        losses: {
            currentValue: [...chartData].filter((item) => item.losses !== 'No Data').at(-1).losses,
            change: (() => {
                const current = chartData.filter((item) => item.losses !== 'No Data').at(-1).losses;
                const cleaned = chartData.filter((item) => item.losses !== 'No Data').sort((a,b) => a.losses - b.losses);
                const middle = Math.floor(cleaned.length  / 2);
                return Number((((current - cleaned[middle].losses) / cleaned[middle].losses) * 100).toFixed(1))
            })()
        },
        profit: {
            currentValue: [...chartData].filter((item) => item.profit !== 'No Data').at(-1).profit,
            change: (() => {
                const current = chartData.filter((item) => item.profit !== 'No Data').at(-1).profit;
                const cleaned = chartData.filter((item) => item.profit !== 'No Data').sort((a,b) => a.profit - b.profit);
                const middle = Math.floor(cleaned.length  / 2);
                return Number((((current - cleaned[middle].profit) / cleaned[middle].profit) * 100).toFixed(1))
            })()
        }
    }

    console.log(currentValues);
    console.log(chartData);
});

module.exports = marketRouter;