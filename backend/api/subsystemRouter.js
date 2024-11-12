const express = require('express');
const marketRouter = express.Router();
const axios = require('axios');
const { Client } = require('pg');
const { namesAndIds, subsystemIDArr } = require('./namesAndIds.js');
const { getMaterialRequirements } = require('./MaterialCalculator/getMaterialRequirements.js');

let client;
if (!process.env.DATABASE_URL) {
    client = new Client({
        user: 'tedfawke',
        host: 'localhost',
        database: 'evesubsystemanalysis_local',
        password: '',
        port: 5432
    });
} else {
    client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        allowExitOnIdle: true
    });
}
client.connect();

const getSubsystemCosts = async (type) => {
    const settings = {
        numSlots: '10',
        refinery: 'Tatara',
        refineryTeRig: 'None',
        refineryMeRig: 'None',
        refinerySystem: 'wormhole',
        complex: 'Azbel',
        complexLargeRig: 'T1',
        complexTeRig: 'None',
        complexMeRig: 'None',
        complexSystem: 'wormhole',
        tataraRig: 'T1',
        componentMaterialEfficiency: 10,
        componentTimeEfficiency: 20,
        ancientRelic: 'Intact',
        decryptor: 'Optimized Attainment Decryptor',
        coreVolume: 0,
        defensiveVolume: 0,
        offensiveVolume: 0,
        propulsionVolume: 0,
        skillLevel: 4,
        implant: '4%',
        buildCostIndex: '0.14',
        reactionCostIndex: '0.14',
        reactionFacilityTax: 0.25,
        complexFacilityTax: 0.25,
        system: 'wormhole',
    };
    if (type === 'core') {
        settings.coreVolume = 1;
    }
    else if (type === 'defensive') {
        settings.defensiveVolume = 1;
    }
    else if (type === 'offensive') {
        settings.offensiveVolume = 1;
    }
    else if (type === 'propulsion') {
        settings.propulsionVolume = 1;
    }

    let allMatsAndQuantities = getMaterialRequirements(settings);
    let matRequirements;
    if (type === 'core') {
        matRequirements = allMatsAndQuantities.coreRequiredMaterials;
    } else if (type === 'defensive') {
        matRequirements = allMatsAndQuantities.defensiveRequiredMaterials;
    } else if (type === 'offensive') {
        matRequirements = allMatsAndQuantities.offensiveRequiredMaterials;
    } else if (type === 'propulsion') {
        matRequirements = allMatsAndQuantities.propulsionRequiredMaterials;
    }

    for (let i = matRequirements.length - 1; i >= 0; i--) {
        const arr = [30002, 30476, 30464, 30474, 30470, 29992, 29994, 30478, 30008];
        if (arr.includes(matRequirements[i].id)) {
            matRequirements.splice(i, 1);
        }
    }

    const oneYearAgo = Math.floor(new Date().setFullYear(new Date().getFullYear() - 1) / 1000);

    const dailyCosts = [];

    try {
        for (const { id, quantity } of matRequirements) {
            const priceDataResponse = await client.query(`
                SELECT DISTINCT ON (date) date, average_price
                FROM price_data
                WHERE type_id = $1 AND date >= $2 AND region = '10000002'
                ORDER BY date ASC, average_price;
                `, [id, oneYearAgo]);

            // console.log(priceDataResponse.rows);

            priceDataResponse.rows.forEach(row => {
                const date = row.date;
                const itemCost = row.average_price * quantity;

                let dayEntry = dailyCosts.find(entry => entry.date === date);
                if (!dayEntry) {
                    dayEntry = { date, totalCost: 0 };
                    dailyCosts.push(dayEntry);
                }

                dayEntry.totalCost += itemCost;
            });
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

// Helper function to retrieve price data by subsystem ID
const getPriceData = async (subsystemID) => {
    return await client.query(`
        SELECT * FROM price_data
        WHERE type_id = $1 AND region = '10000002'
        ORDER BY date ASC
    `, [subsystemID]);
};

const getSubsystemTradeVolume = async (subsystemID) => {
    try {
        const response = await axios.get(`https://esi.evetech.net/latest/markets/10000002/history/?type_id=${subsystemID}`);
        const data = response.data;
        data.splice(0, data.length - 14);
        data.reverse();
        const returnArray = [];
        data.map((entry) => {
            returnArray.push({
                date: entry.date,
                volume: entry.volume
            });
        });
        return returnArray;
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Helper function to retrieve all subsystems data
const getSubsystemsData = async () => {
    const dateInMiliseconds = Date.now() - (14 * 24 * 60 * 60 * 1000);

    return await client.query(`
        SELECT * FROM subsystems WHERE killtime >= ${dateInMiliseconds};
    `);
};

// Helper function to calculate recent loss data by week for a given subsystem
const retrieveLossWeekData = (arr, subId) => {
    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 14); // Adjusted to retrieve one week of data

    const lossesByDay = {};
    arr.forEach(loss => {
        const killDate = new Date(parseInt(loss.killtime, 10)); // Convert killtime to Date
        if (killDate >= oneWeekAgo && killDate <= currentDate && loss.type_id === subId) {
            const dateStr = killDate.toISOString().split('T')[0];
            lossesByDay[dateStr] = (lossesByDay[dateStr] || 0) + 1;
        }
    });

    const result = [];
    for (let d = new Date(oneWeekAgo); d <= currentDate; d = new Date(d.setDate(d.getDate() + 1))) {
        const dateStr = d.toISOString().split('T')[0];
        const [year, month, day] = dateStr.split('-');
        result.push({
            day: `${day}/${month}/${year.slice(-2)}`,
            losses: lossesByDay[dateStr] || 0
        });
    }

    result.pop(); // remove the last day if needed
    return result;
};

// Helper function to generate pie chart data based on subsystem losses
const generatePieChartData = (subsystems) => {
    const pieChartData = {};
    subsystems.forEach(row => {
        if (!pieChartData[row.type_id]) {
            pieChartData[row.type_id] = {
                value: 1,
                name: row.type_name
            };
        } else {
            pieChartData[row.type_id].value += 1;
        }
    });
    return pieChartData;
};

// Main route handler
marketRouter.get('/:subsystemID', async (req, res) => {
    const { subsystemID } = req.params;
    if (!subsystemID || !subsystemIDArr.includes(subsystemID)) {
        res.status(404).send();
        return;
    }

    const subsystemType = namesAndIds.find(subsystem => subsystem.id == Number(subsystemID));
    let type = "";
    if (subsystemType.name.includes("Core")) {
        type = "core";
    } else if (subsystemType.name.includes("Defensive")) {
        type = "defensive";
    } else if (subsystemType.name.includes("Propulsion")) {
        type = "propulsion";
    } else if (subsystemType.name.includes("Offensive")) {
        type = "offensive";
    }

    try {
        // Get subsystem costs, price data, and subsystems in parallel
        const [subsystemCostsResponse, priceDataResponse, subsystemsResponse, tradeVolume] = await Promise.all([
            getSubsystemCosts(type),
            getPriceData(subsystemID),
            getSubsystemsData(),
            getSubsystemTradeVolume(subsystemID)
        ]);

        // console.log(tradeVolume);
        console.log(subsystemsResponse);


        // Process data
        const recentLossData = retrieveLossWeekData(subsystemsResponse.rows, subsystemID);
        const pieChartData = generatePieChartData(subsystemsResponse.rows);

        // Format output
        const output = {
            id: subsystemID,
            recentLossData,
            subsystemCosts: subsystemCostsResponse.slice(-365),
            marketData: priceDataResponse.rows.slice(-365),
            pieChartData,
            tradeVolume: tradeVolume
        };



        res.status(200).send(output);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = marketRouter;
