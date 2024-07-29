const express = require('express');
const marketRouter = express.Router();
const { Client } = require('pg');

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

const subsystemIDArr = ["all", "45622", "45623", "45624", "45625", "45626", "45627", "45628", "45629", "45630", "45631", "45632", "45633", "45586", "45587", "45588", "45589", "45590", "45591", "45592", "45593", "45594", "45595", "45596", "45597", "45610", "45611", "45612", "45613", "45614", "45615", "45616", "45617", "45618", "45619", "45620", "45621", "45598", "45599", "45600", "45601", "45602", "45603", "45604", "45605", "45606", "45607", "45608", "45609"];
const subsystemObjects = [
    { name: "Legion Core - Dissolution Sequencer", id: 45622 },
    { name: "Legion Core - Augmented Antimatter Reactor", id: 45623 },
    { name: "Legion Core - Energy Parasitic Complex", id: 45624 },
    { name: "Tengu Core - Electronic Efficiency Gate", id: 45625 },
    { name: "Tengu Core - Augmented Graviton Reactor", id: 45626 },
    { name: "Tengu Core - Obfuscation Manifold", id: 45627 },
    { name: "Proteus Core - Electronic Efficiency Gate", id: 45628 },
    { name: "Proteus Core - Augmented Fusion Reactor", id: 45629 },
    { name: "Proteus Core - Friction Extension Processor", id: 45630 },
    { name: "Loki Core - Dissolution Sequencer", id: 45631 },
    { name: "Loki Core - Augmented Nuclear Reactor", id: 45632 },
    { name: "Loki Core - Immobility Drivers", id: 45633 },
    { name: "Legion Defensive - Covert Reconfiguration", id: 45586 },
    { name: "Legion Defensive - Augmented Plating", id: 45587 },
    { name: "Legion Defensive - Nanobot Injector", id: 45588 },
    { name: "Tengu Defensive - Covert Reconfiguration", id: 45589 },
    { name: "Tengu Defensive - Supplemental Screening", id: 45590 },
    { name: "Tengu Defensive - Amplification Node", id: 45591 },
    { name: "Proteus Defensive - Covert Reconfiguration", id: 45592 },
    { name: "Proteus Defensive - Augmented Plating", id: 45593 },
    { name: "Proteus Defensive - Nanobot Injector", id: 45594 },
    { name: "Loki Defensive - Covert Reconfiguration", id: 45595 },
    { name: "Loki Defensive - Augmented Durability", id: 45596 },
    { name: "Loki Defensive - Adaptive Defense Node", id: 45597 },
    { name: "Legion Propulsion - Interdiction Nullifier", id: 45610 },
    { name: "Legion Propulsion - Intercalated Nanofibers", id: 45611 },
    { name: "Legion Propulsion - Wake Limiter", id: 45612 },
    { name: "Tengu Propulsion - Interdiction Nullifier", id: 45613 },
    { name: "Tengu Propulsion - Chassis Optimization", id: 45614 },
    { name: "Tengu Propulsion - Fuel Catalyst", id: 45615 },
    { name: "Proteus Propulsion - Interdiction Nullifier", id: 45616 },
    { name: "Proteus Propulsion - Hyperspatial Optimization", id: 45617 },
    { name: "Proteus Propulsion - Localized Injectors", id: 45618 },
    { name: "Loki Propulsion - Interdiction Nullifier", id: 45619 },
    { name: "Loki Propulsion - Intercalated Nanofibers", id: 45620 },
    { name: "Loki Propulsion - Wake Limiter", id: 45621 },
    { name: "Legion Offensive - Liquid Crystal Magnifiers", id: 45598 },
    { name: "Legion Offensive - Assault Optimization", id: 45599 },
    { name: "Legion Offensive - Support Processor", id: 45600 },
    { name: "Tengu Offensive - Accelerated Ejection Bay", id: 45601 },
    { name: "Tengu Offensive - Magnetic Infusion Basin", id: 45602 },
    { name: "Tengu Offensive - Support Processor", id: 45603 },
    { name: "Proteus Offensive - Hybrid Encoding Platform", id: 45604 },
    { name: "Proteus Offensive - Drone Synthesis Projector", id: 45605 },
    { name: "Proteus Offensive - Support Processor", id: 45606 },
    { name: "Loki Offensive - Projectile Scoping Array", id: 45607 },
    { name: "Loki Offensive - Launcher Efficiency Configuration", id: 45608 },
    { name: "Loki Offensive - Support Processor", id: 45609 }
];

marketRouter.get('/:subsystemID', async (req, res) => {
    const { subsystemID } = req.params;
    if (!subsystemID || !subsystemIDArr.includes(subsystemID)) {
        res.status(404).send();
        return;
    }

    const subsystemType = subsystemObjects.find(subsystem => subsystem.id == Number(subsystemID));
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