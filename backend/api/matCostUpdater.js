const axios = require('axios');
const express = require('express');
const { Client } = require('pg');

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

client.connect()
    .catch((err) => {
        console.log("error connecting to database")
        console.log(err)
    })
    .then(() => {
        // console.log("mat cost updater connected to database")
    })

//delete subsystem_costs table
// const deleteTable = async () => {
//     client.query(`DROP TABLE IF EXISTS subsystem_costs;`)
//         .then(() => {
//             console.log('subsystem_costs deleted');
//         })
//         .catch(err => console.log(err))
// }

// deleteTable();
// return;

// client.query(`SELECT * from subsystem_costs;`)
//     .then((res) => {
//         console.log(res.rows)
//     })
//     .catch(err => console.log(err))

// return;

client.query(`CREATE TABLE IF NOT EXISTS subsystem_costs (
    id SERIAL PRIMARY KEY,
    subsystem_type VARCHAR(50),
    region VARCHAR(50),
    date BIGINT,
    average_price NUMERIC,
    highest_price NUMERIC,
    lowest_price NUMERIC
);`)

const coreCosts = {
    //gas (id, quantity)
    30375: 1900,
    30376: 3400,
    30377: 2600,
    30370: 3000,
    30371: 1200,
    30372: 1600,
    30373: 1800,
    30374: 800,
    //fuel blocks (id, quantity)
    4247: 55,
    4246: 80,
    4051: 170,
    4312: 55,
    //salvage (id, quantity)
    30254: 1741,
    30018: 503,
    30259: 112,
    30021: 769,
    30251: 1101,
    30019: 457,
    //minerals (id, quantity)
    37: 2100,
    36: 600,
    38: 4800,
    35: 6400,
    34: 3000,
    39: 1055,
}

const defCosts = {
    //gas (id, quantity)
    30375: 3600,
    30376: 3400,
    30377: 2600,
    30370: 1200,
    30371: 1700,
    30372: 1900,
    30373: 3500,
    //fuel blocks (id, quantity)
    4247: 140,
    4246: 105,
    4051: 170,
    4312: 15,
    //salvage (id, quantity)
    30254: 1741,
    30022: 503,
    30259: 112,
    30021: 769,
    30251: 1101,
    30019: 457,
    //minerals (id, quantity)
    37: 2100,
    36: 7200,
    38: 3200,
    35: 1600,
    34: 3000,
    39: 1480
}

const propCosts = {
    //gas (id, quantity)
    30375: 1900,
    30376: 3400,
    30377: 2600,
    30370: 1600,
    30371: 800,
    30372: 1600,
    30373: 1800,
    30374: 800,
    //fuel blocks (id, quantity)
    4247: 55,
    4246: 50,
    4051: 170,
    4312: 65,
    //salvage (id, quantity)
    30254: 1741,
    30259: 112,
    30021: 769,
    30251: 1101,
    30019: 457,
    30258: 503,
    //minerals (id, quantity)
    37: 2100,
    36: 600,
    38: 4800,
    35: 1600,
    34: 5000,
    39: 1055
}

const offCosts = {
    //gas (id, quantity)
    30375: 3600,
    30376: 3400,
    30377: 2600,
    30370: 1200,
    30371: 1900,
    30372: 2100,
    30373: 3500,
    //fuel blocks (id, quantity)
    4247: 140,
    4246: 115,
    4051: 170,
    4312: 15,
    //salvage (id, quantity)
    30254: 1741,
    30248: 503,
    30259: 112,
    30021: 769,
    30251: 1101,
    30019: 457,
    //minerals (id, quantity)
    37: 2100,
    36: 8400,
    38: 3200,
    35: 1600,
    34: 3000,
    39: 1480,
}

const url = 'https://evetycoon.com/api/v1/market/history/'
const jitaRegion = '10000002';
const amarrRegion = '10000043';
const rensRegion = '10000030';
const hekRegion = '10000042';
const dodixieRegion = '10000032';

const numberOfSubsystemsBeingBuilt = 22;

const maxNumberOfDays = 365;

const makeUrlsArray = (obj, locationId) => {
    const urls = [];
    for (const key in obj) {
        urls.push(url + locationId + '/' + key);
    }
    return urls;
}

const multiplyPriceByQuantity = (product, obj) => {
    for (let i = 0; i < product.length; i++) {
        const productId = product[i].typeId;
        product[i].totalAveragePrice = product[i].average * obj[productId];
        product[i].totalHighestPrice = product[i].highest * obj[productId];
        product[i].totalLowestPrice = product[i].lowest * obj[productId];
    }
    return product;
}

const getSumTotalsArr = (product, arr) => {
    product.forEach((item, index) => {
        if (arr[index]) {
            arr[index].totalAveragePrice += item.totalAveragePrice;
            arr[index].totalHighestPrice += item.totalHighestPrice;
            arr[index].totalLowestPrice += item.totalLowestPrice;
        } else {
            arr.push({
                date: item.date,
                totalAveragePrice: item.totalAveragePrice,
                totalHighestPrice: item.totalHighestPrice,
                totalLowestPrice: item.totalLowestPrice
            });
        }
    });
    return arr;
}

const calculateMaterialCosts = (arr, obj) => {
    arr.forEach(product => {
        multiplyPriceByQuantity(product, obj);
    })
    //at this point arr is an array of all the product prices for the last year
    //we just need to sum them up
    const materialCosts = [];
    arr.forEach((product) => {
        getSumTotalsArr(product, materialCosts);
    })
    return materialCosts;
}

const returnTotalsArray = async (data, obj, type, tradeHub, days) => {
    let lastYearData = [];
    if (days > 0) {
        data.forEach(element => {
            lastYearData.push(element.data.reverse().slice(0, days));
        });
    }

    const materialCostsForYear = calculateMaterialCosts(lastYearData, obj);
    const unitCosts = [];
    materialCostsForYear.forEach((product) => {
        unitCosts.push({
            date: product.date,
            average: Math.floor(product.totalAveragePrice / numberOfSubsystemsBeingBuilt),
            highest: Math.floor(product.totalHighestPrice / numberOfSubsystemsBeingBuilt),
            lowest: Math.floor(product.totalLowestPrice / numberOfSubsystemsBeingBuilt)
        });
    });

    // return unitCosts;
    insertIntoDatabase(unitCosts, type, tradeHub);
}

const getMarketData = async (subsystemType, locationId, type, tradeHub, days) => {
    // console.log("fetching " + type + " costs data for " + days + " days")
    const endpoints = makeUrlsArray(subsystemType, locationId);
    const responses = await axios.all(endpoints.map((endpoint) => axios.get(endpoint)));
    await returnTotalsArray(responses, subsystemType, type, tradeHub, days);
    // console.log("finished fetching " + type + " costs data for " + days + " days")
}

const chill = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const fetchData = async (days) => {
    //core costs
    // console.log("fetching mat costs data for " + days + " days")
    await getMarketData(coreCosts, jitaRegion, "core", "jita", days);
    await chill(2000);
    await getMarketData(coreCosts, amarrRegion, "core", "amarr", days);
    await chill(2000);
    await getMarketData(coreCosts, rensRegion, "core", "rens", days);
    await chill(2000);
    await getMarketData(coreCosts, hekRegion, "core", "hek", days);
    await chill(2000);
    await getMarketData(coreCosts, dodixieRegion, "core", "dodixie", days);
    await chill(2000);
    //defensive costs
    await getMarketData(defCosts, jitaRegion, "defensive", "jita", days);
    await chill(2000);
    await getMarketData(defCosts, amarrRegion, "defensive", "amarr", days);
    await chill(2000);
    await getMarketData(defCosts, rensRegion, "defensive", "rens", days);
    await chill(2000);
    await getMarketData(defCosts, hekRegion, "defensive", "hek", days);
    await chill(2000);
    await getMarketData(defCosts, dodixieRegion, "defensive", "dodixie", days);
    await chill(2000);
    //propulsion costs
    await getMarketData(propCosts, jitaRegion, "propulsion", "jita", days);
    await chill(2000);
    await getMarketData(propCosts, amarrRegion, "propulsion", "amarr", days);
    await chill(2000);
    await getMarketData(propCosts, rensRegion, "propulsion", "rens", days);
    await chill(2000);
    await getMarketData(propCosts, hekRegion, "propulsion", "hek", days);
    await chill(2000);
    await getMarketData(propCosts, dodixieRegion, "propulsion", "dodixie", days);
    await chill(2000);
    //offensive costs
    await getMarketData(offCosts, jitaRegion, "offensive", "jita", days);
    await chill(2000);
    await getMarketData(offCosts, amarrRegion, "offensive", "amarr", days);
    await chill(2000);
    await getMarketData(offCosts, rensRegion, "offensive", "rens", days);
    await chill(2000);
    await getMarketData(offCosts, hekRegion, "offensive", "hek", days);
    await chill(2000);
    await getMarketData(offCosts, dodixieRegion, "offensive", "dodixie", days);
    await chill(2000);
    // console.log("subsystem_costs database updated!!")
}

const getLastDateInDatabase = async () => {
    const res = await client.query(`SELECT date from subsystem_costs ORDER BY date DESC LIMIT 1;`);
    return res.rows[0].date;
}

const getLatestEvetycoonData = async () => {
    let data = axios.get('https://evetycoon.com/api/v1/market/history/10000002/45621')
    return data;
}

const updateDatabase = async () => {
    const lastDateInDb = await getLastDateInDatabase();
    const lastDateInData = await getLatestEvetycoonData();
    lastDateInData.data.reverse();
    if (lastDateInDb == lastDateInData.data[0].date) {
        return;
    }
    
    let numberOfDaysSinceDataInserted = 0;

    for (let i = 0; i < lastDateInData.data.length; i++) {
        if (lastDateInData.data[i].date > lastDateInDb) {
            numberOfDaysSinceDataInserted++;
        }
    }

    // console.log(numberOfDaysSinceDataInserted);

    // console.log("updating " + numberOfDaysSinceDataInserted + " days worth of mat cost data")
    await fetchData(numberOfDaysSinceDataInserted);
}

const gatherData = () => {
    client.query(`SELECT * from subsystem_costs LIMIT 1;`)
    .then((res) => {
        // console.log(res.rows)
        if (res.rows.length === 0) {
            fetchData(maxNumberOfDays);
        } else {
            updateDatabase();
        }
    })
    .catch(err => console.log(err))
}

setInterval(gatherData, 60000);

const insertIntoDatabase = (unitCosts, subsystemType, tradeHub) => {
    unitCosts.forEach((cost) => {
        if(cost.date){
            client.query(`INSERT INTO subsystem_costs (subsystem_type, region, date, average_price, highest_price, lowest_price) VALUES ('${subsystemType}', '${tradeHub}', '${cost.date}', ${cost.average}, ${cost.highest}, ${cost.lowest})`)
        }
    })

}

client.query(`DELETE FROM subsystem_costs
WHERE date < (EXTRACT(EPOCH FROM NOW()) - 31536000) * 1000;`)
    .then((res) => {
        const numberOfDaysDeleted = res.rowCount;
        // console.log(numberOfDaysDeleted + " rows of data deleted from subsystem_costs");
    })
    .catch(err => console.log(err))