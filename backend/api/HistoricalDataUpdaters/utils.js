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

function getMidnightEpochsPastYear() {
    const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set to UTC midnight
    const epochArray = [];

    for (let i = 0; i < 365; i++) {
        const pastDate = new Date(today.getTime() - i * oneDay);
        const epochTime = pastDate.getTime(); // Convert to epoch time
        epochArray.push(epochTime);
    }

    return epochArray.reverse(); // Reverse to get oldest dates first
}


const getMarketData = async (subsystemType, locationId, client, axios, name, locationName, epochs) => {
    const endpoint = makeUrl(subsystemType, locationId);
    const responses = await axios.get(endpoint);
    const pricesArr = responses.data.reverse();
    const prices = pricesArr.slice(0, 365);

    // Ensure dates from the API are treated as UTC when comparing with epochs
    for (let i = 0; i < prices.length; i++) {
        prices[i].date = new Date(prices[i].date).getTime(); // Convert to UTC epoch
    }

    await bulkInsert(prices, client, epochs, locationId, subsystemType, name, locationName);
}

const getPreviousPrice = (prices, currentDay, allDays) => {
    // Get the highest date that is less than the current day
    let arrayOfPriceData = [];

    for (let i = 0; i < prices.length; i++) {
        if (prices[i].date < currentDay) {
            arrayOfPriceData.push(prices[i]);
        }
    }

    // Check if the array is empty
    if (arrayOfPriceData.length === 0) {
        console.log(`No previous price data found for the date: ${new Date(currentDay).toISOString()}`);
        return { average: 0, highest: 0, lowest: 0 }; // Return a default value if no previous price data
    }

    // Get the highest date value from arrayOfPriceData
    let previousPrice = arrayOfPriceData.reduce((prev, current) => (prev.date > current.date) ? prev : current);

    return previousPrice;
}

const bulkInsert = async (prices, client, epochs, locationId, subsystemType, name, locationName) => {
    const oldestDate = epochs[0]; // This is already in UTC

    for (let i = 0; i < prices.length; i++) {
        if (prices[i].date < oldestDate) {
            prices.splice(i, 1);
        }
    }

    prices.sort((a, b) => a.date - b.date);

    let query = 'INSERT INTO price_data (date, region, type_id, average_price, highest_price, lowest_price, order_count, volume, buyVolume, sellVolume, buyOrders, sellOrders, maxBuy, minSell) VALUES ';

    const priceData = [];

    for (let i = 0; i < epochs.length; i++) {
        const epoch = epochs[i];
        const price = prices.find(price => price.date == epoch);
        if (!price) {
            const previousPrice = getPreviousPrice(prices, epoch, epochs);
            prices.push({ date: epoch, average: previousPrice.average, highest: previousPrice.highest, lowest: previousPrice.lowest, order_count: 0, volume: 0 });
            priceData.push({ date: epoch, average: previousPrice.average, highest: previousPrice.highest, lowest: previousPrice.lowest, order_count: 0, volume: 0 });
        } else {
            priceData.push(price);
        }
    }

    priceData.forEach((price, index) => {
        query += `(${Number(price.date)}, '${locationId}', '${subsystemType}', ${Number(price.average)}, ${Number(price.highest)}, ${Number(price.lowest)}, ${price.order_count}, ${price.volume}, 0, 0, 0, 0, 0, 0)`;
        if (index !== priceData.length - 1) {
            query += ',';
        }
    });

    console.log(`Inserting ${priceData.length} rows for ${name} in ${locationName}`);
    client.query(query);
}

const fetchData = async (subsystemIDArr, client, axios) => {
    const epochs = getMidnightEpochsPastYear();
    for (const subsystem of subsystemIDArr) {
        await getMarketData(subsystem.id, jitaRegion, client, axios, subsystem.name, "Jita", epochs);
        await chill(1000);
        await getMarketData(subsystem.id, amarrRegion, client, axios, subsystem.name, "Amarr", epochs);
        await chill(1000);
        await getMarketData(subsystem.id, rensRegion, client, axios, subsystem.name, "Rens", epochs);
        await chill(1000);
        await getMarketData(subsystem.id, hekRegion, client, axios, subsystem.name, "Hek", epochs);
        await chill(1000);
        await getMarketData(subsystem.id, dodixieRegion, client, axios, subsystem.name, "Dodixie", epochs);
        await chill(1000);
    }
}

module.exports = {
    makeUrl,
    fetchData,
    chill,
    getMarketData,
    bulkInsert,
};