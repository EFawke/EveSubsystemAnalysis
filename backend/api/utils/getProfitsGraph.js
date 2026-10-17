const { Client } = require('pg');
const axios = require('axios');
const { getMaterialRequirements } = require('../MaterialCalculator/getMaterialRequirements.js');


let client;
if (!process.env.DATABASE_URL) {
    client = new Client({
        user: process.env.LOCAL_USER,
        host: 'localhost',
        database: process.env.LOCAL_DB,
        password: '',
        port: process.env.LOCAL_PORT
    });
} else {
    client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
        allowExitOnIdle: true,
    });
}
client.connect();

const calculateMedian = (arr) => {
    const sorted = arr.slice().map(Number).sort((a, b) => a - b); // Ensure all elements are numbers
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
};

const getSubsystemCosts = async (settings, oneMonthAgo) => {
    let allMatsAndQuantities = getMaterialRequirements(settings);
    let matRequirements;
    if (settings.name.toLowerCase().includes('core')) {
        matRequirements = allMatsAndQuantities.coreRequiredMaterials;
    } else if (settings.name.toLowerCase().includes('defensive')) {
        matRequirements = allMatsAndQuantities.defensiveRequiredMaterials;
    } else if (settings.name.toLowerCase().includes('offensive')) {
        matRequirements = allMatsAndQuantities.offensiveRequiredMaterials;
    } else if (settings.name.toLowerCase().includes('propulsion')) {
        matRequirements = allMatsAndQuantities.propulsionRequiredMaterials;
    }

    for (let i = matRequirements.length - 1; i >= 0; i--) {
        const arr = [30002, 30476, 30464, 30474, 30470, 29992, 29994, 30478, 30008]; //remove components from price estimate
        if (arr.includes(matRequirements[i].id) || matRequirements[i].name === 'None') {
            matRequirements.splice(i, 1);
        }
    }

    const dailyCosts = [];

    try {
        for (const { id, quantity } of matRequirements) { // use settings.materialsOrderType instead here. fuck.
            let column = "maxbuy";
            if (settings.materialsOrderType == "sell") {
                column = "minsell";
            }
            const costQuery = `
            
            SELECT DISTINCT ON (day) to_char(to_timestamp(date / 1000) AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
            ${column}
            FROM price_data
            WHERE type_id = $1 AND region = $2 AND date >= $3
            ORDER BY day ASC, date DESC;
            
            `
            const priceDataResponse = await client.query(costQuery, [id, settings.materialsLocation, oneMonthAgo]);
            
            priceDataResponse.rows.forEach(row => {
                const day = row.day;
                const itemCost = row[column] * quantity;

                let dayEntry = dailyCosts.find(entry => entry.day === day);
                if (!dayEntry) {
                    dayEntry = { day, totalCost: 0 };
                    dailyCosts.push(dayEntry);
                }

                dayEntry.totalCost += itemCost;
            })
        }

        dailyCosts.forEach(entry => {
            entry.totalCost = entry.totalCost / 22;
        });
        return dailyCosts; // Each entry in dailyCosts is { date, totalCost }

    } catch (error) {
        console.error("Error fetching subsystem costs:", error);
        return [];
    }
};

const getProfits = (matCosts, marketData) => {
    let returnObject = {};
    returnObject.title = "Profit";
    returnObject.currentValue = Number(marketData.currentValue).toFixed(0) - Number(matCosts.currentValue).toFixed(2);
    returnObject.dates = marketData.dates;
    returnObject.dataValues = marketData.dataValues.map((value, index) => {
        return Number(value).toFixed(0) - Number(matCosts.dataValues[index]).toFixed(2);
    });
    const lastThirtyDays = returnObject.dataValues.slice(-30);
    const sortedThirtyDays = [...lastThirtyDays].sort((a, b) => a - b);
    let median = 0;
    if (sortedThirtyDays.length > 0) {
        const mid = Math.floor(sortedThirtyDays.length / 2);
        median = sortedThirtyDays.length % 2 !== 0 ? sortedThirtyDays[mid] : (sortedThirtyDays[mid - 1] + sortedThirtyDays[mid]) / 2;
    }
    if (median > 0) {
        returnObject.thirtyDayMedianDelta = (((returnObject.currentValue - median) / median) * 100).toFixed(1);
    }
    return returnObject;
};

const getPriceData = (array, column) => {
    let returnObject = {};
    returnObject.title = column === "maxbuy" ? "Max Buy" : "Min Sell";
    returnObject.currentValue = array[0][column];
    returnObject.dates = array.map(entry => entry.date);
    returnObject.dataValues = array.map(entry => entry[column]);

    const lastThirtyDays = returnObject.dataValues.slice(-30);
    const sortedThirtyDays = [...lastThirtyDays].sort((a, b) => a - b);

    const thirtyDayMedian = calculateMedian(sortedThirtyDays);

    const pricePercentageChange = thirtyDayMedian
        ? ((Number(returnObject.currentValue) - thirtyDayMedian) / thirtyDayMedian) * 100
        : 0;
    
    returnObject.thirtyDayMedianDelta = Number(pricePercentageChange).toFixed(1);

    return returnObject;
}

module.exports = {
    getSubsystemCosts,
    getProfits,
    getPriceData,
    calculateMedian
};