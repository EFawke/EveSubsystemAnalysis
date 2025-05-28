const { namesAndIds, materialsNamesAndIds } = require('../utils/namesAndIds.js');
const { fetchData } = require('./utils.js');
const axios = require('axios');

const getMaxHistData = async (client) => {
    const maxHistData = await client.query(`SELECT MAX(date)
        FROM price_data
        WHERE region = 10000002
        AND type_id = 34
        AND maxBuy = 0`)
        .then((res) => {
            return res.rows[0].max;
        })
        .catch((err) => {
            console.log(err);
        });

    return maxHistData;
}

const getMinStatData = async (client) => {
    const minStatData = await client.query(`SELECT MIN(date)
        FROM price_data
        WHERE region = 10000002
        AND type_id = 34
        AND highest_price = 0`)
        .then((res) => {
            return res.rows[0].min;
        })
        .catch((err) => {
            console.log(err);
        });

    return minStatData;
}

const checkIfMissingDateIsntMissing = async (client, missingData) => {
    const missingDataCheck = await client.query(`SELECT * FROM price_data WHERE date = ${missingData} AND region = 10000002 AND type_id = 34`)
        .then((res) => {
            return res.rows.length;
        })
        .catch((err) => {
            console.log(err);
        });

    return missingDataCheck;
}

const backDate = async (client) => {
    const minStatData = await getMinStatData(client);
    const maxHistData = await getMaxHistData(client);

    // Ensure both min and max data are available
    if (!minStatData || !maxHistData) {
        console.log("Unable to fetch minimum or maximum historical data.");
        return;
    }

    // Calculate the range of missing dates in daily intervals
    let currentMissingDate = Number(maxHistData) + 1000 * 60 * 60 * 24; // Start from the day after the latest historical date
    const endMissingDate = Number(minStatData); // Go back to the minimum statistical date

    while (currentMissingDate <= endMissingDate) {
        const missingDataCheck = await checkIfMissingDateIsntMissing(client, currentMissingDate);

        if (missingDataCheck) {
            console.log(`Data for date ${new Date(currentMissingDate).toISOString().split('T')[0]} is already in the database.`);
        } else {
            console.log(`Fetching missing data for date: ${new Date(currentMissingDate).toISOString().split('T')[0]}`);
            await fetchData(currentMissingDate, namesAndIds, materialsNamesAndIds, client, axios);
            console.log(`Data fetched for date: ${new Date(currentMissingDate).toISOString().split('T')[0]}`);
        }

        // Move to the next day
        currentMissingDate += 1000 * 60 * 60 * 24; // Increment by one day in milliseconds
    }
}

module.exports = { backDate };