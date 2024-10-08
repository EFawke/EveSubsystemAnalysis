const jitaRegion = '10000002';
const amarrRegion = '10000043';
const rensRegion = '10000030';
const hekRegion = '10000042';
const dodixieRegion = '10000032';

const makeUrl = (subId, locationId) => {
    return `https://esi.evetech.net/latest/markets/${locationId}/history/?datasource=tranquility&type_id=${subId}`
}

const chill = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getMarketData = async (subsystemType, locationId, client, axios, name, locationName, missingDate) => {
    const endpoint = makeUrl(subsystemType, locationId);
    const responses = await axios.get(endpoint);
    const pricesArr = responses.data.reverse();
    let data = pricesArr.find((price) => {
        let priceDate = new Date(price.date).getTime(); // price.date from ESI is in UTC
        if (priceDate === missingDate) {
            return price;
        }
    });

    if(!data){
        await client.query(`SELECT * FROM price_data WHERE date < ${missingDate} AND region = '${locationId}' AND type_id = '${subsystemType}' ORDER BY date DESC LIMIT 1;`)
            .then((res) => {
                data = res.rows[0];
                insertData(data, client, subsystemType, locationId, name, locationName, missingDate, "not found");
            });
    } else {
        insertData(data, client, subsystemType, locationId, name, locationName, missingDate, "found");
    }
}

const insertData = (data, client, subsystemType, locationId, name, locationName, missingDate, identifier) => {
    let query = '';
    if(identifier === "found"){
        query = `INSERT INTO price_data (date, region, type_id, average_price, highest_price, lowest_price, order_count, volume, buyVolume, sellVolume, buyOrders, sellOrders, maxBuy, minSell) 
        VALUES (${Number(missingDate)}, '${locationId}', '${subsystemType}', ${Number(data.average)}, ${Number(data.highest)}, ${Number(data.lowest)}, ${data.order_count}, ${data.volume}, 0, 0, 0, 0, 0, 0)`;
    }

    if(identifier === "not found"){
        query = `INSERT INTO price_data (date, region, type_id, average_price, highest_price, lowest_price, order_count, volume, buyVolume, sellVolume, buyOrders, sellOrders, maxBuy, minSell) 
        VALUES (${Number(missingDate)}, '${locationId}', '${subsystemType}', ${Number(data.average_price)}, ${Number(data.highest_price)}, ${Number(data.lowest_price)}, ${data.order_count}, ${data.volume}, 0, 0, 0, 0, 0, 0)`;
    }

    client.query(query);
}

const fetchData = async (missingDate, namesAndIds, materialsNamesAndIds, client, axios) => {
    for (const subsystem of namesAndIds) {
        await getMarketData(subsystem.id, jitaRegion, client, axios, subsystem.name, "Jita", missingDate);
        await chill(1000);
        await getMarketData(subsystem.id, amarrRegion, client, axios, subsystem.name, "Amarr", missingDate);
        await chill(1000);
        await getMarketData(subsystem.id, rensRegion, client, axios, subsystem.name, "Rens", missingDate);
        await chill(1000);
        await getMarketData(subsystem.id, hekRegion, client, axios, subsystem.name, "Hek", missingDate);
        await chill(1000);
        await getMarketData(subsystem.id, dodixieRegion, client, axios, subsystem.name, "Dodixie", missingDate);
        await chill(1000);
    }
    await chill(1000);
    for(const material of materialsNamesAndIds){
        await getMarketData(material.id, jitaRegion, client, axios, material.name, "Jita", missingDate);
        await chill(1000);
        await getMarketData(material.id, amarrRegion, client, axios, material.name, "Amarr", missingDate);
        await chill(1000);
        await getMarketData(material.id, rensRegion, client, axios, material.name, "Rens", missingDate);
        await chill(1000);
        await getMarketData(material.id, hekRegion, client, axios, material.name, "Hek", missingDate);
        await chill(1000);
        await getMarketData(material.id, dodixieRegion, client, axios, material.name, "Dodixie", missingDate);
        await chill(1000);
    }
}

module.exports = {
    makeUrl,
    fetchData,
    chill,
    getMarketData,
};