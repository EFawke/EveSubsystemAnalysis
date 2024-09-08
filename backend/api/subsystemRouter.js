const express = require('express');
const marketRouter = express.Router();
const { Client } = require('pg');

const { namesAndIds, subsystemIDArr } = require('./namesAndIds.js');

let client;
if (!process.env.DATABASE_URL) {
    client = new Client();
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
        const subsystemCostsResponse = await client.query(`SELECT * FROM subsystem_costs WHERE subsystem_type = '${type}' AND region = 'jita' ORDER BY date ASC`);
        const priceDataResponse = await client.query(`SELECT * FROM price_data WHERE type_id = '${subsystemID}' AND region = '10000002' ORDER BY date ASC`);
        const subsystemsResponse = await client.query(`SELECT * FROM subsystems`);

        const retrieveLossWeekData = (arr, subId) => {
            const currentDate = new Date();
            const oneWeekAgo = new Date(currentDate);
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 14);
            const lossesByDay = {};
            arr.forEach(loss => {
                const killDate = new Date(loss.killtime);
                if (killDate >= oneWeekAgo && killDate <= currentDate) {
                    if (loss.type_id === subId) {
                        const dateStr = killDate.toISOString().split('T')[0];
                        if (!lossesByDay[dateStr]) {
                            lossesByDay[dateStr] = 0;
                        }
                        lossesByDay[dateStr]++;
                    }
                }
            });
            const result = [];
            for (let d = new Date(oneWeekAgo); d <= currentDate; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const [year, month, day] = dateStr.split('-');
                result.push({
                    day: `${day}/${month}/${year.slice(-2)}`,
                    losses: lossesByDay[dateStr] || 0
                });
            }

            //remove the last day
            result.pop();

            return result;
        };
        

        const recentLossData = retrieveLossWeekData(subsystemsResponse.rows, req.params.subsystemID);

        let pieChartData = {};
        subsystemsResponse.rows.forEach(row => {
            if (!pieChartData[row.type_id]) {
                pieChartData[row.type_id] = {
                    value: 1,
                    name: row.type_name
                };
            } else {
                pieChartData[row.type_id].value += 1;
            }
        });

        const output = {
            id: subsystemID,
            recentLossData: recentLossData,
            subsystemCosts: subsystemCostsResponse.rows,
            marketData: priceDataResponse.rows,
            pieChartData
        };

        res.status(200).send(output);
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

module.exports = marketRouter;