const { namesAndIds, materialsNamesAndIds } = require('../namesAndIds.js');
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
    let missingData = Number(maxHistData) + 1000 * 60 * 60 * 24;

    const missingDataCheck = await checkIfMissingDateIsntMissing(client, missingData);

    if(missingDataCheck){
        console.log("Data is already in the database");        
        return;
    }

    if(minStatData && maxHistData){
        fetchData(missingData, namesAndIds, materialsNamesAndIds, client, axios);
        console.log("data is fetched uwu");
    }
}

module.exports = { backDate };