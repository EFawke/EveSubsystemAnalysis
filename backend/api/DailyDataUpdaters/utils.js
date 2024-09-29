const jitaRegion = '10000002';
const amarrRegion = '10000043';
const rensRegion = '10000030';
const hekRegion = '10000042';
const dodixieRegion = '10000032';

const getPrevData = async (client, locationId, subsystemType, column) => {
    const query = `SELECT ${column} FROM price_data WHERE region = '${locationId}' AND type_id = '${subsystemType}' ORDER BY date DESC LIMIT 1`;
    const res = await client.query(query);
    if(!res.rows[0]){
        return 0;
    }
    return res.rows[0][column] || 0;
}

const makeUrl = (subId, locationId) => {
    return `https://evetycoon.com/api/v1/market/stats/${locationId}/${subId}`;
}

const chill = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getMarketData = async (subsystemType, locationId, client, axios, name, locationName, epoch, type) => {
    const endpoint = makeUrl(subsystemType, locationId);
    const responses = await axios.get(endpoint)
    console.log(responses.data);
    let query = 'INSERT INTO price_data (date, region, type_id, average_price, highest_price, lowest_price, order_count, volume, buyVolume, sellVolume, buyOrders, sellOrders, maxBuy, minSell) VALUES ';
    const data = responses.data;

    if (isNaN(data.minSell) || isNaN(data.maxBuy) || isNaN(data.buyVolume) || isNaN(data.sellVolume) || isNaN(data.buyOrders) || isNaN(data.sellOrders) || !isFinite(data.minSell) || !isFinite(data.maxBuy) || !isFinite(data.buyVolume) || !isFinite(data.sellVolume) || !isFinite(data.buyOrders) || !isFinite(data.sellOrders)) {
        console.error("Invalid price data detected: ", data);
        if(!isFinite(data.minSell) || isNaN(data.minSell) && type === "sub") {
            data.minSell = await getPrevData(client, locationId, subsystemType, "average_price");
        }
        if(!isFinite(data.minSell) || isNaN(data.minSell) && type === "mat") {
            data.minSell = await getPrevData(client, locationId, subsystemType, "average_price");
        }
        if(!isFinite(data.maxBuy) || isNaN(data.maxBuy) && type === "mat") {
            data.maxBuy = await getPrevData(client, locationId, subsystemType, "average_price");
        }
        if(!isFinite(data.buyVolume) || isNaN(data.buyVolume)) {
            data.buyVolume = await getPrevData(client, locationId, subsystemType, "buyVolume");
        }
        if(!isFinite(data.sellVolume) || isNaN(data.sellVolume)) {
            data.sellVolume = await getPrevData(client, locationId, subsystemType, "sellVolume");
        }
        if(!isFinite(data.buyOrders) || isNaN(data.buyOrders)) {
            data.buyOrders = await getPrevData(client, locationId, subsystemType, "buyOrders");
        }
        if(!isFinite(data.sellOrders) || isNaN(data.sellOrders)) {
            data.sellOrders = await getPrevData(client, locationId, subsystemType, "sellOrders");
        }
    }

    if(type === "sub") {
        query += `(${epoch}, '${locationId}', '${subsystemType}', ${Number(data.minSell)}, ${0}, ${0}, ${0}, ${0}, ${Number(data.buyVolume)}, ${Number(data.sellVolume)}, ${Number(data.buyOrders)}, ${Number(data.sellOrders)}, ${Number(data.maxBuy)}, ${Number(data.minSell)})`;
    } else {
        query += `(${epoch}, '${locationId}', '${subsystemType}', ${Number(data.maxBuy)}, ${0}, ${0}, ${0}, ${0}, ${Number(data.buyVolume)}, ${Number(data.sellVolume)}, ${Number(data.buyOrders)}, ${Number(data.sellOrders)}, ${Number(data.maxBuy)}, ${Number(data.minSell)})`;
    }

    console.log(`Inserting ${name} in ${locationName} at ${epoch} minSell: ${data.minSell}`);
    client.query(query)
}

const fetchData = async (subsystemIDArr, client, axios, epoch, type) => {
    for (const subsystem of subsystemIDArr) {
        await getMarketData(subsystem.id, jitaRegion, client, axios, subsystem.name, "Jita", epoch, type);
        await chill(1000);
        await getMarketData(subsystem.id, amarrRegion, client, axios, subsystem.name, "Amarr", epoch, type);
        await chill(1000);
        await getMarketData(subsystem.id, rensRegion, client, axios, subsystem.name, "Rens", epoch, type);
        await chill(1000);
        await getMarketData(subsystem.id, hekRegion, client, axios, subsystem.name, "Hek", epoch, type);
        await chill(1000);
        await getMarketData(subsystem.id, dodixieRegion, client, axios, subsystem.name, "Dodixie", epoch, type);
        await chill(1000);
    }
}

module.exports = {
    makeUrl,
    fetchData,
    chill,
    getMarketData,
};