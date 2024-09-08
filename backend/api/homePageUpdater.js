const axios = require('axios');
const { Client } = require('pg');
const { namesAndIds, subsystemIDArr } = require('./namesAndIds.js');

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
    }).then((res) => {
        console.log(res);
    });
};

createTable();

const dropTable = () => {
    client.query(`DROP TABLE home;`).catch((err) => {
        console.log(err);
    }).then((res) => {
        console.log(res);
    });
};

// dropTable();

const fetchPrices = async (region, subsystemId) => {
    let url = `https://evetycoon.com/api/v1/market/stats/${region}/${subsystemId}`;
    let res = await axios.get(url);
    return res.data;
};

const chill = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

let isUpdating = false;

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

    //updaing the home page table
    let query = `INSERT INTO home 
    (date, item_id, jitaData, amarrData, dodixieData, hekData, rensData) VALUES 
    (${dateEpoch}, ${subsystemId}, '${JSON.stringify(jitaData)}', '${JSON.stringify(amarrData)}', '${JSON.stringify(dodixieData)}', '${JSON.stringify(hekData)}', '${JSON.stringify(rensData)}');`;

    try {
        await client.query(query);

        //update the market table here as well.
    } catch (err) {
        console.log(err);
    }
};

const fetchCostsData = async (dateEpoch, subsystemType) => {
    
};

const updateHomeTable = async (epoch) => {
    if (isUpdating) return;

    let date = new Date(epoch);

    // Check if the date is more than 5 seconds past midnight
    if (date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() >= 5) {
        return;
    }

    date.setUTCHours(0, 0, 0, 0);
    let dateEpoch = date.getTime(); // to be added to the table later!!!
    let query = `SELECT * FROM home WHERE date = ${dateEpoch};`;

    try {
        const res = await client.query(query);
        if (res.rows.length === 0) {
            isUpdating = true;
            await Promise.all(subsystemIDArr.map(element => fetchData(dateEpoch, element)));
        }
    } catch (err) {
        console.log(err);
    } finally {
        isUpdating = false;
    }
};

// Run updateHomeTable every second
setInterval(() => {
    updateHomeTable(Date.now());
}, 1000);
