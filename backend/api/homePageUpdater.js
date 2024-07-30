const axios = require('axios');
const { Client } = require('pg');
const { namesAndIds, subsystemIDArr } = require('./namesAndIds.js');

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

client.connect();

const createTable = () => {
    client.query(`CREATE TABLE IF NOT EXISTS home (
        id SERIAL PRIMARY KEY,
        date BIGINT,
        item_id INT,
        jitaData JSONB,
        amarrData JSONB,
        dodixieData JSONB,
        hekData JSONB,
        rensData JSONB
        );`).catch((err) => {
            console.log(err);
        })
        .then((res) => {
            console.log(res);
        })
}

createTable();

const dropTable = () => {
    client.query(`DROP TABLE home;`).catch((err) => {
        console.log(err);
    })
        .then((res) => {
            console.log(res);
        })
}

// dropTable();

const fetchPrices = async (region, subsystemId) => {
    let url = `https://evetycoon.com/api/v1/market/stats/10000002/45622`;
    let res = await axios.get(url);
    return res.data;
}

const chill = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const fetchData = async (dateEpoch, subsystemId) => {
    const jitaRegion = '10000002';
    const amarrRegion = '10000043';
    const rensRegion = '10000030';
    const hekRegion = '10000042';
    const dodixieRegion = '10000032';
    await chill(1000);
    let jitaData = await fetchPrices(jitaRegion, subsystemId);
    await chill(1000);
    let amarrData = await fetchPrices(amarrRegion, subsystemId);
    await chill(1000);
    let dodixieData = await fetchPrices(dodixieRegion, subsystemId);
    await chill(1000);
    let hekData = await fetchPrices(hekRegion, subsystemId);
    await chill(1000);
    let rensData = await fetchPrices(rensRegion, subsystemId);

    let query = `INSERT INTO home 
    (id, date, item_id, jitaData, amarrData, dodixieData, hekData, rensData) VALUES 
    (NULL, ${dateEpoch}, ${subsystemId}, '${JSON.stringify(jitaData)}', '${JSON.stringify(amarrData)}', '${JSON.stringify(dodixieData)}', '${JSON.stringify(hekData)}', '${JSON.stringify(rensData)}');`;
    try {
        await client.query
            (query);
    }
    catch (err) {
        console.log(err);
    }
}

const updateHomeTable = async (epoch) => {
    let date = new Date(epoch);

    //check if the date is more than 5 seconds past midnight
    if (date.getHours() !== 0){
        return;
    }
    if (date.getMinutes() !== 0){
        return;
    }
    if (date.getSeconds() >= 5){
        return;
    }

    date.setUTCHours(0, 0, 0, 0);
    //convert the date back to an epoch
    let dateEpoch = date.getTime(); // to be added to the table later!!!
    let query = `SELECT * FROM home WHERE date = ${dateEpoch};`;
    let res
    try {
        res = await client.query
            (query);
    }
    catch (err) {
        console.log(err);
    }
    if (res.rows.length > 0) {
        console.log("date already in table");
        return;
    }
    subsystemIDArr.forEach(element => {
        fetchData(dateEpoch, element); 
    });
}

//run updateHomeTable every second
setInterval(() => {
    updateHomeTable(Date.now());
}, 1000);

// client.query(`SELECT * FROM home;`)
//     .then((res) => {
//         console.log(res.rows);
//     })
//     .catch((err) => {
//         console.log(err);
//     })