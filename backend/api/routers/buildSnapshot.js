const axios = require('axios');
const { Client } = require('pg');
const { regions, materialsNamesAndIds } = require('../utils/namesAndIds.js');

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
        ssl: {
            rejectUnauthorized: false
        },
        allowExitOnIdle: true
    });
}

client.connect();

const createBuildSnapshotTable = async () => {
    client.query(`CREATE TABLE IF NOT EXISTS "build_snapshot" (
        id SERIAL PRIMARY KEY,
        date BIGINT,
        region BIGINT,
        type_id BIGINT,
        item_name VARCHAR,
        min_sell NUMERIC,
        min_sell_percent NUMERIC,
        max_buy NUMERIC,
        max_buy_percent NUMERIC
        );`)
        .then(() => {
            console.log('Created build_snapshot');
        })
}

createBuildSnapshotTable();

const buildSnapshot = async () => {
    const date = Date.now();
    const priceAveragesLastMonth = await client.query(`
    SELECT type_id, region, ROUND(AVG(maxbuy)) as average_buy_value, ROUND(AVG(minsell)) as average_sell_value 
    FROM price_data 
    WHERE to_timestamp(date / 1000) > now() - interval '30 days' 
    AND type_id IN (${materialsNamesAndIds.map((item) => item.id).join(',')}) 
    GROUP BY type_id, region;`);

    const mostRecentPrices = await client.query(`
    WITH latest AS 
      (SELECT type_id, region, to_timestamp(date/1000), maxbuy, minsell, ROW_NUMBER() 
        OVER(PARTITION BY type_id, region ORDER BY date DESC) 
      AS rn FROM price_data WHERE maxbuy != 0 AND minsell != 0 AND type_id IN (${materialsNamesAndIds.map((item) => item.id).join(',')})) 
    SELECT * FROM latest WHERE rn = 1;`);

    const queries = [];

    materialsNamesAndIds.map((item) => {
        for (let i = 0; i < regions.length; i++) {
            const minsell = Number(mostRecentPrices.rows.find((row) => row.type_id == item.id && row.region == regions[i]).minsell);
            const maxbuy = Number(mostRecentPrices.rows.find((row) => row.type_id == item.id && row.region == regions[i]).maxbuy);
            const avgsell = Number(priceAveragesLastMonth.rows.find((row) => row.type_id == item.id && row.region == regions[i]).average_sell_value);
            const avgbuy = Number(priceAveragesLastMonth.rows.find((row) => row.type_id == item.id && row.region == regions[i]).average_buy_value);
            const minSellPercentageChange = avgsell
                ? ((minsell - avgsell) / avgsell) * 100
                : 0;
            const maxBuyPercentageChange = avgbuy
                ? ((maxbuy - avgbuy) / avgbuy) * 100
                : 0;
            queries.push(`(${date}, ${regions[i]}, ${item.id}, '${item.name}', ${minsell}, ${minSellPercentageChange.toFixed(2)}, ${maxbuy}, ${maxBuyPercentageChange.toFixed(2)})`);
        }
    })

    await client.query(`INSERT INTO build_snapshot (date, region, type_id, item_name, min_sell, min_sell_percent, max_buy, max_buy_percent) VALUES ${queries}`).then((res) => {
        console.log(res);
        console.log('rows inserted');
    }).catch((err) => console.log(err));
    // console.log(`INSERT INTO build_snapshot (date, region, type_id, item_name, min_sell, min_sell_percent, max_buy, max_buy_percent) VALUES ${queries}`);
    await client.query(`DELETE FROM build_snapshot WHERE date != ${date}`)
    .then((res) => {
        console.log(res);
        console.log('rows deleted');
    }).catch((err) => console.log(err));
}

module.exports = {
    buildSnapshot
};
