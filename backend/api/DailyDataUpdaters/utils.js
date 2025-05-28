const jitaRegion = '10000002';
const amarrRegion = '10000043';
const rensRegion = '10000030';
const hekRegion = '10000042';
const dodixieRegion = '10000032';

const getLowestSellOrderPrice = async (orders, client, locationId, subsystemType) => {
    const sellOrders = orders.filter(order => !order.is_buy_order);
    if (sellOrders.length !== 0) {
        return sellOrders.reduce((lowest, order) => Math.min(lowest, order.price), Infinity);
    } else {
        const minSell = await getPrevData(client, locationId, subsystemType, "minSell");
        return minSell;
    }
}

const getHighestBuyOrderPrice = async (orders, client, locationId, subsystemType) => {
    const buyOrders = orders.filter(order => order.is_buy_order);
    if (buyOrders.length !== 0) {
        return buyOrders.reduce((highest, order) => Math.max(highest, order.price), -Infinity);
    } else {
        const maxBuy = await getPrevData(client, locationId, subsystemType, "maxBuy");
        return maxBuy;
    }
}

function getSellVolume(orders) {
    return orders
        .filter(order => !order.is_buy_order)
        .reduce((totalVolume, order) => totalVolume + order.volume_remain, 0);
}

function getBuyVolume(orders) {
    return orders
        .filter(order => order.is_buy_order)
        .reduce((totalVolume, order) => totalVolume + order.volume_remain, 0);
}

function getBuyOrderCount(orders) {
    return orders.filter(order => order.is_buy_order).length;
}

function getSellOrderCount(orders) {
    return orders.filter(order => !order.is_buy_order).length;
}

const getPrevData = async (client, locationId, subsystemType, column) => {
    const query = `SELECT ${column} FROM price_data WHERE region = '${locationId}' AND type_id = '${subsystemType}' AND ${column} > 0 ORDER BY date DESC LIMIT 1`;
    console.log(query);
    const res = await client.query(query);
    if (!res.rows[0]) {
        console.log(`No previous data found for ${subsystemType} in ${locationId}`);
        return 0;
    }
    console.log(res.rows[0][column]);
    return res.rows[0][column] || 0;
}

const apiFailBackup = async (client, locationId, subsystemType) => {
    const query = `SELECT * FROM price_data WHERE region = '${locationId}' AND type_id = '${subsystemType}' ORDER BY date DESC LIMIT 1`;
    const res = await client.query(query);
    if (!res.rows[0]) {
        return 0;
    }
    return res.rows[0];
}

const makeUrl = (subId, locationId) => {
    return `https://esi.evetech.net/latest/markets/${locationId}/orders/?type_id=${subId}`
}

const chill = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const apiCall = async (url, axios, name, locationName, subsystemType, locationId, client) => {
    const maxRetries = 5;
    let attempt = 0;
    let responses;

    while (attempt < maxRetries) {
        try {
            responses = await axios.get(url);
            return responses;  // Return immediately on success
        } catch (err) {
            attempt++;
            console.error(`Attempt ${attempt} failed for ${name} in ${locationName}:`, err.message);

            if (attempt >= maxRetries) {
                console.error(`Max retries reached for ${name} in ${locationName}. Using backup data.`);
                break;  // Exit the loop after reaching max retries
            }

            // Exponential backoff before retrying
            const backoffTime = Math.pow(2, attempt) * 1000;
            await chill(backoffTime);
        }
    }

    // Fallback to previous data from the database if all retries fail
    const backupData = await apiFailBackup(client, locationId, subsystemType);
    backupData.isPrevData = true;
    backupData.minSell = backupData.minSell || 0;
    backupData.maxBuy = backupData.maxBuy || 0;
    backupData.buyVolume = backupData.buyVolume || 0;
    backupData.sellVolume = backupData.sellVolume || 0;
    backupData.buyOrders = backupData.buyOrders || 0;
    backupData.sellOrders = backupData.sellOrders || 0;

    return backupData;
};


const getMarketData = async (subsystemType, locationId, client, axios, name, locationName, epoch, type) => {
    const endpoint = makeUrl(subsystemType, locationId);
    const responses = await apiCall(endpoint, axios, name, locationName, subsystemType, locationId);
    let query = 'INSERT INTO price_data (date, region, type_id, average_price, highest_price, lowest_price, order_count, volume, buyVolume, sellVolume, buyOrders, sellOrders, maxBuy, minSell) VALUES ';
    const data = {};

    if (responses.isPrevData) {
        // console.log("is prev data?")
        data.minSell = responses.minSell;
        data.maxBuy = responses.maxBuy;
        data.buyVolume = responses.buyVolume;
        data.sellVolume = responses.sellVolume;
        data.buyOrders = responses.buyOrders;
        data.sellOrders = responses.sellOrders;
    } else {
        // console.log("is not prev data?")
        data.minSell = await getLowestSellOrderPrice(responses.data, client, locationId, subsystemType);
        data.maxBuy = await getHighestBuyOrderPrice(responses.data, client, locationId, subsystemType);
        data.sellVolume = getSellVolume(responses.data);
        data.buyVolume = getBuyVolume(responses.data);
        data.sellOrders = getSellOrderCount(responses.data)
        data.buyOrders = getBuyOrderCount(responses.data)
    }


    if (isNaN(data.minSell) || isNaN(data.maxBuy) || isNaN(data.buyVolume) || isNaN(data.sellVolume) || isNaN(data.buyOrders) || isNaN(data.sellOrders) || !isFinite(data.minSell) || !isFinite(data.maxBuy) || !isFinite(data.buyVolume) || !isFinite(data.sellVolume) || !isFinite(data.buyOrders) || !isFinite(data.sellOrders)) {
        // console.error("Invalid price data detected: ", data);
        if (!isFinite(data.minSell) || isNaN(data.minSell) && type === "sub") {
            data.minSell = await getPrevData(client, locationId, subsystemType, "minSell");
        }
        if (!isFinite(data.minSell) || isNaN(data.minSell) && type === "mat") {
            data.minSell = await getPrevData(client, locationId, subsystemType, "minSell");
        }
        if (!isFinite(data.maxBuy) || isNaN(data.maxBuy) && type === "mat") {
            data.maxBuy = await getPrevData(client, locationId, subsystemType, "maxBuy");
        }
        if (!isFinite(data.buyVolume) || isNaN(data.buyVolume)) {
            data.buyVolume = await getPrevData(client, locationId, subsystemType, "buyVolume");
        }
        if (!isFinite(data.sellVolume) || isNaN(data.sellVolume)) {
            data.sellVolume = await getPrevData(client, locationId, subsystemType, "sellVolume");
        }
        if (!isFinite(data.buyOrders) || isNaN(data.buyOrders)) {
            data.buyOrders = await getPrevData(client, locationId, subsystemType, "buyOrders");
        }
        if (!isFinite(data.sellOrders) || isNaN(data.sellOrders)) {
            data.sellOrders = await getPrevData(client, locationId, subsystemType, "sellOrders");
        }
    }

    if (type === "sub") {
        query += `(${epoch}, '${locationId}', '${subsystemType}', ${Number(data.minSell)}, ${0}, ${0}, ${0}, ${0}, ${Number(data.buyVolume)}, ${Number(data.sellVolume)}, ${Number(data.buyOrders)}, ${Number(data.sellOrders)}, ${Number(data.maxBuy)}, ${Number(data.minSell)})`;
    } else {
        query += `(${epoch}, '${locationId}', '${subsystemType}', ${Number(data.maxBuy)}, ${0}, ${0}, ${0}, ${0}, ${Number(data.buyVolume)}, ${Number(data.sellVolume)}, ${Number(data.buyOrders)}, ${Number(data.sellOrders)}, ${Number(data.maxBuy)}, ${Number(data.minSell)})`;
    }

    // console.log(`Inserting ${name} in ${locationName} at ${epoch} minSell: ${data.minSell}, maxBuy: ${data.maxBuy}`);
    client.query(query);
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