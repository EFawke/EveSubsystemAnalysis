const axios = require('axios');
const { Client } = require('pg');
const { namesAndIds, materialsNamesAndIds } = require('./namesAndIds.js');

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

const updateFromPrevData = async (dateEpoch, regionId, itemId, client, type, iterator) => {
    console.log(`Updating from previous data for date ${dateEpoch}, region ${regionId}, item ${itemId} looking in the past ${iterator} days`);
    if(iterator > 10){
        if(type === "maxbuy"){
            await client.query(`UPDATE price_data SET maxbuy = 0 WHERE date = ${dateEpoch} AND region = ${regionId} AND type_id = ${itemId};`);
        }
        if(type === "minsell"){
            await client.query(`UPDATE price_data SET minsell = 0 WHERE date = ${dateEpoch} AND region = ${regionId} AND type_id = ${itemId};`);
        }
        return;
    }
    let prevDate = dateEpoch - 24 * 60 * 60 * 1000;
    let result = await client.query(`SELECT * FROM price_data WHERE date = ${prevDate} AND region = ${regionId} AND type_id = ${itemId} AND ${type} != 0;`);
    let prevData = result.rows;
    if (prevData.length > 0) {
        if (type === "maxbuy") {
            await client.query(`UPDATE price_data SET maxbuy = ${prevData[0].maxbuy} WHERE date = ${dateEpoch} AND region = ${regionId} AND type_id = ${itemId};`);
        } else if (type === "minsell") {
            await client.query(`UPDATE price_data SET minsell = ${prevData[0].minsell} WHERE date = ${dateEpoch} AND region = ${regionId} AND type_id = ${itemId};`);
        }
    } else {
        await updateFromPrevData(prevDate, regionId, itemId, client, type, iterator += 1);
    }
}

const checkDataInDatabase = async (dataInDatabase, historicalData, dateEpoch, regionId, itemId, client) => {
    const data = historicalData.find((data) => data.date === dateEpoch); //data in the api

    if (dataInDatabase.length === 0 && data != null) {
        console.log(`Inserting new data for date ${dateEpoch}, region ${regionId}, item ${itemId}`);
        await client.query(`INSERT INTO price_data (date, region, type_id, average_price, highest_price, lowest_price, order_count, volume, buyvolume, sellvolume, buyorders, sellorders, maxbuy, minsell)
                      VALUES (${Number(dateEpoch)}, ${Number(regionId)}, ${Number(itemId)}, ${Number(data.average)}, ${Number(data.highest)}, ${Number(data.lowest)}, ${Number(data.order_count)}, ${Number(data.volume)}, 0, 0, 0, 0, ${(Number(data.lowest) + Number(data.average))/2}, ${(Number(data.highest) + Number(data.average)) / 2});`);
        return;
    }

    if (dataInDatabase[0].maxbuy == 0 && data != null) {
        console.log(`Updating maxbuy for date ${dateEpoch}, region ${regionId}, item ${itemId}`);
        await client.query(`UPDATE price_data SET maxbuy = ${(Number(data.lowest) + Number(data.average))/2} WHERE date = ${Number(dateEpoch)} AND region = ${Number(regionId)} AND type_id = ${Number(itemId)};`);
    }

    if(dataInDatabase[0].minsell == 0 && data != null){
        console.log(`Updating minsell for date ${dateEpoch}, region ${regionId}, item ${itemId}`);
        await client.query(`UPDATE price_data SET minsell = ${(Number(data.highest) + Number(data.average)) / 2} WHERE date = ${Number(dateEpoch)} AND region = ${Number(regionId)} AND type_id = ${Number(itemId)};`);
    }

    if(data == null && dataInDatabase.length > 0){
        console.log(`Updating from previous data for date ${dateEpoch}, region ${regionId}, item ${itemId}`);
        // sometimes data is null because the api skips days with no trade data
        let maxbuy = dataInDatabase[0]?.maxbuy;
        let minsell = dataInDatabase[0]?.minsell;
        let iterator = 1;
        if(!maxbuy || maxbuy == 0){
            await updateFromPrevData(dateEpoch, regionId, itemId, client, "maxbuy", iterator);
        }
        if(!minsell || minsell == 0){
            await updateFromPrevData(dateEpoch, regionId, itemId, client, "minsell", iterator);
        }
    }

    if(dataInDatabase[0].maxbuy != 0 && dataInDatabase[0].minsell != 0){
        console.log(`Nothing to update, fine ${dateEpoch}, region ${regionId}, item ${itemId}`);
    }
};

const fixDatabase = async (regionId, dateEpochs, ids, axios, client) => {
    for (let i = 0; i < ids.length; i++) {
        const itemId = ids[i].id;
        const url = `https://esi.evetech.net/latest/markets/${regionId}/history/?datasource=tranquility&type_id=${itemId}`;

        try {
            const res = await axios.get(url);  // Await the API response
            const historicalData = res.data;

            // Convert date strings to epoch timestamps
            historicalData.forEach((data) => {
                const date = new Date(data.date);
                data.date = date.getTime();
            });

            // For each date, check and update the database
            for (let j = 0; j < dateEpochs.length; j++) {
                const result = await client.query(
                    `SELECT * FROM price_data WHERE date = $1 AND region = $2 AND type_id = $3;`,
                    [dateEpochs[j], regionId, itemId]
                );
                await checkDataInDatabase(result.rows, historicalData, dateEpochs[j], regionId, itemId, client);
            }
        } catch (error) {
            console.error(`Error processing item ID ${itemId} in region ${regionId}:`, error);
        }
    }
};

const updatePriceData = async () => {
    const jitaRegion = '10000002';
    const amarrRegion = '10000043';
    const rensRegion = '10000030';
    const hekRegion = '10000042';
    const dodixieRegion = '10000032';

    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    let dateEpoch = date.getTime();
    let oneDayIncrement = 24 * 60 * 60 * 1000;
    let numDays = 365;
    let dateEpochs = [];
    for (let i = 0; i < numDays; i++) {
        dateEpochs.push(dateEpoch);
        dateEpoch -= oneDayIncrement;
    }

    dateEpochs = dateEpochs.reverse();

    await fixDatabase(jitaRegion, dateEpochs, namesAndIds, axios, client);
    console.log("Finished Jita subsystems");
    await fixDatabase(jitaRegion, dateEpochs, materialsNamesAndIds, axios, client);
    console.log("Finished Jita materials");
    await fixDatabase(amarrRegion, dateEpochs, namesAndIds, axios, client);
    console.log("Finished Amarr subsystems");
    await fixDatabase(amarrRegion, dateEpochs, materialsNamesAndIds, axios, client);
    console.log("Finished Amarr materials");
    await fixDatabase(rensRegion, dateEpochs, namesAndIds, axios, client);
    console.log("Finished Rens subsystems");
    await fixDatabase(rensRegion, dateEpochs, materialsNamesAndIds, axios, client);
    console.log("Finished Rens materials");
    await fixDatabase(hekRegion, dateEpochs, namesAndIds, axios, client);
    console.log("Finished Hek subsystems");
    await fixDatabase(hekRegion, dateEpochs, materialsNamesAndIds, axios, client);
    console.log("Finished Hek materials");
    await fixDatabase(dodixieRegion, dateEpochs, namesAndIds, axios, client);
    console.log("Finished Dodixie subsystems");
    await fixDatabase(dodixieRegion, dateEpochs, materialsNamesAndIds, axios, client);
    console.log("Finished Dodixie materials");
    console.log("Finished updating price data");

    await client.end();
}

module.exports = { updatePriceData };