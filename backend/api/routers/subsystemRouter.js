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

marketRouter.post(`/:subsystemID`, async (req, res) => {
    /* 
        Updated on 8/10/2026
    */
    const id = Number(req.params.subsystemID);
    const settings = req.body;
    const time = new Date().setUTCHours(0, 0, 0, 0);
    const twentyfourhours = 24 * 60 * 60 * 1000
    let dates = [];
    for(let i = 0; i < 30; i++){
        dates.push(time - (twentyfourhours * i));
    }

    try {
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
    
        console.log(pricesQuery)
        console.log(prices)


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
    
        console.log(chartData);
    
        let currentValues = {
            minSell: {
                title: "Min Sell",
                currentValue: [...chartData].filter((item) => item.minSell !== 'No Data').at(-1).minSell,
                change: (() => {
                    const current = chartData.filter((item) => item.minSell !== 'No Data').at(-1).minSell;
                    const cleaned = chartData.filter((item) => item.minSell !== 'No Data').sort((a,b) => a.minSell - b.minSell);
                    const middle = Math.floor(cleaned.length  / 2);
                    return Number((((current - cleaned[middle].minSell) / cleaned[middle].minSell) * 100).toFixed(1))
                })()
            },
            maxBuy: {
                title: "Max Buy",
                currentValue: [...chartData].filter((item) => item.maxBuy !== 'No Data').at(-1).maxBuy,
                change: (() => {
                    const current = chartData.filter((item) => item.maxBuy !== 'No Data').at(-1).maxBuy;
                    const cleaned = chartData.filter((item) => item.maxBuy !== 'No Data').sort((a,b) => a.maxBuy - b.maxBuy);
                    const middle = Math.floor(cleaned.length  / 2);
                    return Number((((current - cleaned[middle].maxBuy) / cleaned[middle].maxBuy) * 100).toFixed(1))
                })()
            },
            totalCost: {
                title: "Material Cost",
                currentValue: [...chartData].filter((item) => item.totalCost !== 'No Data').at(-1).totalCost,
                change: (() => {
                    const current = chartData.filter((item) => item.totalCost !== 'No Data').at(-1).totalCost;
                    const cleaned = chartData.filter((item) => item.totalCost !== 'No Data').sort((a,b) => a.totalCost - b.totalCost);
                    const middle = Math.floor(cleaned.length  / 2);
                    return Number((((current - cleaned[middle].totalCost) / cleaned[middle].totalCost) * 100).toFixed(1))
                })()
            },
            profit: {
                title: "Profit",
                currentValue: [...chartData].filter((item) => item.profit !== 'No Data').at(-1).profit,
                change: (() => {
                    const current = chartData.filter((item) => item.profit !== 'No Data').at(-1).profit;
                    const cleaned = chartData.filter((item) => item.profit !== 'No Data').sort((a,b) => a.profit - b.profit);
                    const middle = Math.floor(cleaned.length  / 2);
                    return Number((((current - cleaned[middle].profit) / cleaned[middle].profit) * 100).toFixed(1))
                })()
            },
            losses: {
                title: "Losses",
                currentValue: [...chartData].filter((item) => item.losses !== 'No Data').at(-1).losses,
                change: (() => {
                    const current = chartData.filter((item) => item.losses !== 'No Data').at(-1).losses;
                    const cleaned = chartData.filter((item) => item.losses !== 'No Data').sort((a,b) => a.losses - b.losses);
                    const middle = Math.floor(cleaned.length  / 2);
                    return Number((((current - cleaned[middle].losses) / cleaned[middle].losses) * 100).toFixed(1))
                })()
            },
            sellVol: {
                title: "Sell Volume",
                currentValue: [...chartData].filter((item) => item.sellVol !== 'No Data').at(-1).sellVol,
                change: (() => {
                    const current = chartData.filter((item) => item.sellVol !== 'No Data').at(-1).sellVol;
                    const cleaned = chartData.filter((item) => item.sellVol !== 'No Data').sort((a,b) => a.sellVol - b.sellVol);
                    const middle = Math.floor(cleaned.length  / 2);
                    return Number((((current - cleaned[middle].sellVol) / cleaned[middle].sellVol) * 100).toFixed(1))
                })()
            },
            buyVol: {
                title: "Buy Volume",
                currentValue: [...chartData].filter((item) => item.buyVol !== 'No Data').at(-1).buyVol,
                change: (() => {
                    const current = chartData.filter((item) => item.buyVol !== 'No Data').at(-1).buyVol;
                    const cleaned = chartData.filter((item) => item.buyVol !== 'No Data').sort((a,b) => a.buyVol - b.buyVol);
                    const middle = Math.floor(cleaned.length  / 2);
                    return Number((((current - cleaned[middle].buyVol) / cleaned[middle].buyVol) * 100).toFixed(1))
                })()
            },
            tradeVol: {
                title: "Trade Volume",
                currentValue: chartData.filter((item) => item.tradeVol !== 'No Data').at(-1).tradeVol,
                change: (() => {
                    const current = chartData.filter((item) => item.tradeVol !== 'No Data').at(-1).tradeVol;
                    const cleaned = chartData.filter((item) => item.tradeVol !== 'No Data').sort((a,b) => a.tradeVol - b.tradeVol);
                    const middle = Math.floor(cleaned.length  / 2);
                    return Number((((current - cleaned[middle].tradeVol) / cleaned[middle].tradeVol) * 100).toFixed(1))
                })()
            },
        }
    
        res.status(200).send({
            currentValues: currentValues,
            chartData: chartData
        });
    }

    catch(err) {
        console.log(err)
        res.errored(err)
    }
});

module.exports = marketRouter;