const { namesAndIds, materialsNamesAndIds } = require('../utils/namesAndIds.js');
const { fetchData } = require('./utils.js');
const axios = require('axios');

let isUpdating = false;

const updatePriceTable = async (epoch, client) => {
    if (isUpdating) return;

    let date = new Date(epoch);

    if (date.getUTCHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() >= 2) {
        return;
    }

    console.log("Updating price table for date:", date.toISOString());

    date.setUTCHours(0, 0, 0, 0);
    let dateEpoch = date.getTime();
    let query = `SELECT * FROM price_data WHERE date = ${dateEpoch};`;


    try {
        const res = await client.query(query);
        if (res.rows.length === 0) {
            console.log("No data found, updating...");
            isUpdating = true;
            await fetchData(namesAndIds, client, axios, dateEpoch, "sub"); // fetch subsystems and update prices
            await fetchData(materialsNamesAndIds, client, axios, dateEpoch, "mat"); // fetch materials and update prices
        } else {
            console.log("Data already exists for this date");
        }
    }
    catch (err) {
        console.log(err);
    }
    finally {
        isUpdating = false;
    }
}

module.exports = { updatePriceTable };