const express = require('express');
const marketRouter = express.Router();
const { Client } = require('pg');
const { getMaterialRequirements } = require('./MaterialCalculator/getMaterialRequirements.js');
const axios = require('axios');

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

const calculateMedian = (arr) => {
    const sorted = arr.slice().map(Number).sort((a, b) => a - b); // Ensure all elements are numbers
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
};

marketRouter.use(express.json());

const getSubsystemCosts = async (type, settings, oneYearAgo) => {
    let allMatsAndQuantities = getMaterialRequirements(settings);
    let matRequirements;
    if (type.name.toLowerCase().includes('core')) {
        matRequirements = allMatsAndQuantities.coreRequiredMaterials;
    } else if (type.name.toLowerCase().includes('defensive')) {
        matRequirements = allMatsAndQuantities.defensiveRequiredMaterials;
    } else if (type.name.toLowerCase().includes('offensive')) {
        matRequirements = allMatsAndQuantities.offensiveRequiredMaterials;
    } else if (type.name.toLowerCase().includes('propulsion')) {
        matRequirements = allMatsAndQuantities.propulsionRequiredMaterials;
    }

    for (let i = matRequirements.length - 1; i >= 0; i--) {
        const arr = [30002, 30476, 30464, 30474, 30470, 29992, 29994, 30478, 30008]; //remove components from price estimate
        if (arr.includes(matRequirements[i].id)) {
            matRequirements.splice(i, 1);
        }
    }

    // const oneYearAgo = Math.floor(new Date().setFullYear(new Date().getFullYear() - 1) / 1000);

    const dailyCosts = [];

    try {
        for (const { id, quantity } of matRequirements) { // use settings.materialsOrderType instead here. fuck.
            let column = "maxbuy";
            if(settings.materialsOrderType == "sell"){
                column = "minsell";
            }
            const priceDataResponse = await client.query(`
                SELECT DISTINCT ON (date) date, ${column}
                FROM price_data
                WHERE type_id = ${id} AND date > ${oneYearAgo} AND region = '${settings.materialsLocation}'
                ORDER BY date DESC;`);

            priceDataResponse.rows.forEach(row => {
                const date = row.date;
                const itemCost = row[column] * quantity;

                let dayEntry = dailyCosts.find(entry => entry.date === date);
                if (!dayEntry) {
                    dayEntry = { date, totalCost: 0 };
                    dailyCosts.push(dayEntry);
                }

                dayEntry.totalCost += itemCost;
            })
        }

        dailyCosts.forEach(entry => {
            entry.totalCost = entry.totalCost / 22;
        });

        return dailyCosts; // Each entry in dailyCosts is { date, totalCost }
    } catch (error) {
        console.error("Error fetching subsystem costs:", error);
        return [];
    }
};

const getMinSell = (latestData, historicalData) => {
    const minSell = {};
    minSell.title = "Min sell";
    const sellOrders = latestData.filter(order => !order.is_buy_order);
    sellOrders.sort((a, b) => a.price - b.price);
    minSell.currentValue = sellOrders[0].price;
    const thirtyDaysAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
    const prices = [];
    for (let i = 0; i < historicalData.length; i++) {
        if (historicalData[i].date < thirtyDaysAgo) {
            break;
        }
        prices.push(historicalData[i].average_price);
    }
    const thirtyDayMedian = calculateMedian(prices);
    const minSellPercentageChange = thirtyDayMedian
        ? ((Number(minSell.currentValue) - thirtyDayMedian) / thirtyDayMedian) * 100
        : 0;
    minSell.thirtyDayMedianDelta = Number(minSellPercentageChange).toFixed(1);
    const dates = [];
    const dataValues = [];
    for(let i = 0; i < historicalData.length; i++) {
        dates.push(historicalData[i].date);
        if(historicalData[i].minsell == 0){
            dataValues.push(historicalData[i].average_price);
        } else {
            dataValues.push(historicalData[i].minsell);
        }
    }
    minSell.dates = dates;
    minSell.dataValues = dataValues;
    return minSell;
};

const getMaxBuy = (latestData, historicalData) => {
    const maxBuy = {};
    maxBuy.title = "Max buy";
    const buyOrders = latestData.filter(order => order.is_buy_order);
    buyOrders.sort((a, b) => b.price - a.price);
    maxBuy.currentValue = buyOrders[0].price;
    const thirtyDaysAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
    const prices = [];
    for (let i = 0; i < historicalData.length; i++) {
        if (historicalData[i].date < thirtyDaysAgo) {
            break;
        }
        prices.push(historicalData[i].maxbuy);
    }
    const thirtyDayMedian = calculateMedian(prices);
    const maxBuyPercentageChange = thirtyDayMedian
        ? ((Number(maxBuy.currentValue) - thirtyDayMedian) / thirtyDayMedian) * 100
        : 0;
    maxBuy.thirtyDayMedianDelta = Number(maxBuyPercentageChange).toFixed(1);
    const dates = [];
    const dataValues = [];
    for(let i = 0; i < historicalData.length; i++) {
        dates.push(historicalData[i].date);
        if(historicalData[i].maxbuy == 0){
            dataValues.push(historicalData[i].lowest_price);
        } else {
            dataValues.push(historicalData[i].maxbuy);
        }
    }
    maxBuy.dates = dates;
    maxBuy.dataValues = dataValues;
    return maxBuy;
};

const getMatCosts = (costsData) => {
    const matCosts = {};
    matCosts.title = "Material costs";
    const dates = [];
    const dataValues = [];
    const thirtyDaysAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;

    const thirtyDaysCosts = [];
    matCosts.currentValue = Number(costsData[0].totalCost).toFixed(2);

    for(let i = 0; i < costsData.length; i++) {
        dates.push(costsData[i].date);
        dataValues.push(Number(costsData[i].totalCost).toFixed(2));
        if(costsData[i].date > thirtyDaysAgo){
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
    const buyOrders = latestData.filter(order => order.is_buy_order);
    let currentVolume = 0;
    for(let i = 0; i < buyOrders.length; i++){
        currentVolume += buyOrders[i].volume_remain;
    }
    buyVolume.currentValue = currentVolume;
    const thirtyDaysAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
    const volumes = [];
    for (let i = 0; i < historicalData.length; i++) {
        if (historicalData[i].date < thirtyDaysAgo) {
            break;
        }
        volumes.push(historicalData[i].buyvolume);
    }

    const thirtyDayMedian = calculateMedian(volumes);
    const buyVolumePercentageChange = thirtyDayMedian
        ? ((Number(buyVolume.currentValue) - thirtyDayMedian) / thirtyDayMedian) * 100
        : 0;
    buyVolume.thirtyDayMedianDelta = Number(buyVolumePercentageChange).toFixed(1);
    const dates = [];
    const dataValues = [];
    for(let i = 0; i < historicalData.length; i++) {
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
    const sellOrders = latestData.filter(order => !order.is_buy_order);
    let currentVolume = 0;
    for(let i = 0; i < sellOrders.length; i++){
        currentVolume += sellOrders[i].volume_remain;
    }
    sellVolume.currentValue = currentVolume;
    const thirtyDaysAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
    const volumes = [];
    for (let i = 0; i < historicalData.length; i++) {
        if (historicalData[i].date < thirtyDaysAgo) {
            break;
        }
        volumes.push(historicalData[i].sellvolume);
    }

    const thirtyDayMedian = calculateMedian(volumes);
    const sellVolumePercentageChange = thirtyDayMedian
        ? ((Number(sellVolume.currentValue) - thirtyDayMedian) / thirtyDayMedian) * 100
        : 0;
    sellVolume.thirtyDayMedianDelta = Number(sellVolumePercentageChange).toFixed(1);
    const dates = [];
    const dataValues = [];
    for(let i = 0; i < historicalData.length; i++) {
        dates.push(historicalData[i].date);
        dataValues.push(historicalData[i].sellvolume);
    }
    sellVolume.dates = dates;
    sellVolume.dataValues = dataValues;
    return sellVolume;
};

const getTradeVolume = (historicalData) => {
    const tradeVolume = {};
    tradeVolume.title = "Trade volume";
    const dates = [];
    const dataValues = [];
    const thirtyDaysAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
    const thirtyDaysTradeVolume = [];
    let currentVolume = 0;
    for(let i = 0; i < historicalData.length; i++){
        const date = new Date(historicalData[i].date);
        date.setUTCHours(0, 0, 0, 0);
        dates.push(date.getTime());
        dataValues.push(historicalData[i].volume);
        if(date > thirtyDaysAgo){
            thirtyDaysTradeVolume.push(historicalData[i].volume);
        }
        if(i == 0){
            currentVolume = historicalData[i].volume;
        }
    }
    tradeVolume.currentValue = currentVolume;
    const thirtyDayMedian = calculateMedian(thirtyDaysTradeVolume);
    const tradeVolumePercentageChange = thirtyDayMedian
        ? ((Number(tradeVolume.currentValue) - thirtyDayMedian) / thirtyDayMedian) * 100
        : 0;
    tradeVolume.thirtyDayMedianDelta = Number(tradeVolumePercentageChange).toFixed(1);
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

const getProfits = (matCosts, marketData) => {
    let returnObject = {};
    returnObject.title = "Profit";
    returnObject.currentValue = Number(marketData.currentValue).toFixed(0) - Number(matCosts.currentValue).toFixed(2);
    returnObject.dates = marketData.dates;
    returnObject.dataValues = marketData.dataValues.map((value, index) => {
        return Number(value).toFixed(0) - Number(matCosts.dataValues[index]).toFixed(2);
    });
    const lastThirtyDays = returnObject.dataValues.slice(-30);
    const sortedThirtyDays = [...lastThirtyDays].sort((a, b) => a - b);
    let median = 0;
    if (sortedThirtyDays.length > 0) {
        const mid = Math.floor(sortedThirtyDays.length / 2);
        median = sortedThirtyDays.length % 2 !== 0 ? sortedThirtyDays[mid] : (sortedThirtyDays[mid - 1] + sortedThirtyDays[mid]) / 2;
    }
    if (median > 0) {
        returnObject.thirtyDayMedianDelta = (((returnObject.currentValue - median) / median) * 100).toFixed(1);
    }
    return returnObject;
};

marketRouter.post(`/:subsystemID`, async (req, res) => {
    const id = req.params.subsystemID;
    const settings = req.body;
    const time = new Date().getTime();
    const twentyfourhours = 24 * 60 * 60 * 1000
    const yesterday = time - twentyfourhours;
    const oneYearAgo = Math.floor(new Date().setFullYear(new Date().getFullYear() - 1));
    Promise.all([
        client.query(`SELECT * FROM subsystems WHERE type_id = ${id} AND killtime > ${oneYearAgo} ORDER BY killtime DESC;`),
        client.query(`SELECT * FROM price_data WHERE type_id = ${id} AND region = ${settings.subsystemsLocation} AND date > ${oneYearAgo} ORDER BY date DESC;`),
        getSubsystemCosts(settings, settings, oneYearAgo),
        axios.get(`https://esi.evetech.net/latest/markets/${settings.subsystemsLocation}/history/?datasource=tranquility&type_id=${id}`),// for the trade volume!!! (defaults to date ASC and about 2 years of data!!)
        client.query(`SELECT * FROM subsystems WHERE type_id = ${id} AND killtime > ${yesterday};`),
        axios.get(`https://esi.evetech.net/latest/markets/${settings.subsystemsLocation}/orders/?type_id=${id}`),
    ])
        .then(data => {
            const subsystems = data[0].rows;
            const priceData = data[1].rows;
            const costsData = data[2];
            const historicalMarketData = data[3].data;
            const dailyLosses = data[4].rows.length;
            const marketDataCurrent = data[5].data;

            const minSell = getMinSell(data[5].data, data[1].rows);
            const maxBuy = getMaxBuy(data[5].data, data[1].rows);
            const matCosts = getMatCosts(costsData);

            let profit = null;
            if(settings.subsystemsOrderType == 'buy'){
                profit = getProfits(matCosts, maxBuy);
            }
            if(settings.subsystemsOrderType == 'sell'){
                profit = getProfits(matCosts, minSell);
            }
            const buyVolume = getBuyVolume(data[5].data, data[1].rows);
            const sellVolume = getSellVolume(data[5].data, data[1].rows);
            const tradeVolume = getTradeVolume(data[3].data.reverse().splice(0, 365));
            const lossesData = getLossesData(subsystems);
            res.status(200).json({ minSell, maxBuy, matCosts, profit, buyVolume, sellVolume, tradeVolume, lossesData });
        })
});

module.exports = marketRouter;