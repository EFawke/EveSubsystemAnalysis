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

const backDate = async (client) => {

    const minStatData = await getMinStatData(client);
    console.log(minStatData);

    const maxHistData = await getMaxHistData(client);
    console.log(maxHistData);

    if(minStatData && maxHistData){
        console.log("data is fetched uwu");
    }
}

module.exports = { backDate };