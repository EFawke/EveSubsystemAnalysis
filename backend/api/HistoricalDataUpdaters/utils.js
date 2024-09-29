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
    const timezoneOffset = today.getTimezoneOffset() * 60 * 1000; // Offset in milliseconds
    today.setHours(0, 0, 0, 0);
    today.setTime(today.getTime() - timezoneOffset - oneDay); // Set to midnight of the previous day
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
    const responses = await axios.get(endpoint)
    const pricesArr = responses.data.reverse();
    const prices = pricesArr.slice(0, 365);
    await bulkInsert(prices, client, epochs, locationId, subsystemType, name, locationName);
}

const getPreviousPrice = (prices, currentDay, allDays) => {
    // get the highest date that is less than the current day
    let arrayOfPriceData = [];

    for (let i = 0; i < prices.length; i++) {
        if (prices[i].date < currentDay) {
            arrayOfPriceData.push(prices[i]);
        }
    }

    //get the highest date value from arrayOfPriceData
    let previousPrice = arrayOfPriceData.reduce((prev, current) => (prev.date > current.date) ? prev : current);

    return previousPrice;
}

const bulkInsert = async (prices, client, epochs, locationId, subsystemType, name, locationName) => {
    for (let i = 0; i < prices.length; i++) {
        const date = prices[i].date
        const midnight = new Date(date);
        const epochTime = midnight.getTime();
        prices[i].date = epochTime;
    }
    const oldestDate = epochs[0];

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
            if (i == 0) {
                priceData.push({ date: epoch, average: 0, highest: 0, lowest: 0, order_count: 0, volume: 0 });
                prices.push({ date: epoch, average: 0, highest: 0, lowest: 0, order_count: 0, volume: 0 });
            } else {
                // priceData.push({ date: epoch, average: priceData[i - 1].average, highest: priceData[i - 1].highest, lowest: priceData[i - 1].lowest, order_count: 0, volume: 0 });
                const previousPrice = getPreviousPrice(prices, epoch, epochs)
                prices.push({ date: epoch, average: previousPrice.average, highest: previousPrice.highest, lowest: previousPrice.lowest, order_count: 0, volume: 0 });
                priceData.push({ date: epoch, average: previousPrice.average, highest: previousPrice.highest, lowest: previousPrice.lowest, order_count: 0, volume: 0 });
            }
        } else {
            priceData.push(price);
        }
    }

    priceData.forEach((price, index) => {
        if (isNaN(price.average) || isNaN(price.highest) || isNaN(price.lowest) ||
            !isFinite(price.average) || !isFinite(price.highest) || !isFinite(price.lowest)) {
            console.error("Invalid price data detected: ", price);
            if(isNaN(price.average) || !isFinite(price.average)) {
                price.average = 0;
            }
            if(isNaN(price.highest) || !isFinite(price.highest)) {
                price.highest = 0;
            }
            if(isNaN(price.lowest) || !isFinite(price.lowest)) {
                price.lowest = 0;
            }
        }

        query += `(${Number(price.date)}, '${locationId}', '${subsystemType}', ${Number(price.average)}, ${Number(price.highest)}, ${Number(price.lowest)}, ${price.order_count}, ${price.volume}, 0, 0, 0, 0, 0, 0)`;
        if (index !== priceData.length - 1) {
            query += ',';
        }
    });

    console.log(`Inserting ${priceData.length} rows for ${name} in ${locationName}`);

    client.query(query)
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