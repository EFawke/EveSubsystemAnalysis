const axios = require('axios');
const { Client } = require('pg');

let client;
if (!process.env.DATABASE_URL) {
    client = new Client()
} else {
    client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        allowExitOnIdle: true
    });
}

client.connect()

//delete price_data table
// const deleteTable = async () => {
//     client.query(`DROP TABLE IF EXISTS price_data;`)
//         .then(() => {
//             console.log('price_data deleted');
//         })
//         .catch(err => console.log(err))
// }

// deleteTable();
// return;

client.query(`CREATE TABLE IF NOT EXISTS "price_data" (
    id SERIAL PRIMARY KEY,
    date BIGINT,
    region VARCHAR(50),
    type_id VARCHAR(50),
    average_price NUMERIC,
    highest_price NUMERIC,
    lowest_price NUMERIC,
    order_count INT,
    volume INT);`)

client.query(`SELECT * FROM price_data;`)
    .then((res) => {
        console.log("HERE IS PRICE DATA");
        console.log(res.rows);
    })

const subsystemIDArr = [
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
]

const url = 'https://evetycoon.com/api/v1/market/history/'
const jitaRegion = '10000002';
const amarrRegion = '10000043';
const rensRegion = '10000030';
const hekRegion = '10000042';
const dodixieRegion = '10000032';

const maxNumberOfDays = 365;

const makeUrl = (subId, locationId) => {
    return url + locationId + '/' + subId;
}

const bulkInsert = async (prices) => {
    let query = 'INSERT INTO price_data (date, region, type_id, average_price, highest_price, lowest_price, order_count, volume) VALUES ';
    prices.forEach((price, index) => {
        query += `(${price.date}, '${price.regionId}', '${price.typeId}', ${price.average}, ${price.highest}, ${price.lowest}, ${price.orderCount}, ${price.volume})`;
        if (index !== prices.length - 1) {
            query += ',';
        }
    }
    )
    client.query(query)
}

const getMarketData = async (subsystemType, locationId, days) => {
    if (days > 0) {
        const endpoint = makeUrl(subsystemType, locationId);
        const responses = await axios.get(endpoint)
        const pricesArr = responses.data.reverse();
        const prices = pricesArr.slice(0, days);
        await bulkInsert(prices);
    }
}

const chill = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const fetchData = async (days) => {
    // console.log('fetching market data... for ' + days + ' days');
    for (const subsystem of subsystemIDArr) {
        await getMarketData(subsystem.id, jitaRegion, days);
        await chill(1000);
        await getMarketData(subsystem.id, amarrRegion, days);
        await chill(1000);
        await getMarketData(subsystem.id, rensRegion, days);
        await chill(1000);
        await getMarketData(subsystem.id, hekRegion, days);
        await chill(1000);
        await getMarketData(subsystem.id, dodixieRegion, days);
        await chill(1000);
    }
    // console.log('market data fetched!!');
}

const getLastDateInDatabase = async () => {
    const res = await client.query(`SELECT date from price_data ORDER BY date DESC LIMIT 1;`);
    return res.rows[0].date;
}

const getLatestEvetycoonData = async () => {
    const data = axios.get('https://evetycoon.com/api/v1/market/history/10000002/45622')
    return data;
}

const updateDatabase = async () => {
    let numberOfDaysSinceDataInserted = 0;
    const lastDateInDb = await getLastDateInDatabase();
    const lastDateInData = await getLatestEvetycoonData();
    lastDateInData.data.reverse();

    if (lastDateInDb == lastDateInData.data[0].date) {
        return;
    }

    for (let i = 0; i < lastDateInData.data.length; i++) {
        if (lastDateInData.data[i].date > lastDateInDb) {
            numberOfDaysSinceDataInserted++;
        }
    }

    // console.log("NUMBER OF DAYS SINCE DATA INSERTED:");
    // console.log(numberOfDaysSinceDataInserted);

    await fetchData(numberOfDaysSinceDataInserted)
}

const gatherData = () => {
    client.query(`SELECT * from price_data LIMIT 1;`)
    .then((res) => {
        if (res.rows.length === 0) {
            // console.log("NO DATA IN PRICE_DATA TABLE");
            fetchData(maxNumberOfDays);
        } else {
            // console.log("SOME DATA FOUND IN PRICE_DATA TABLE, WHICH IS GOOD");
            updateDatabase();
        }
    })
    .catch(err => console.log(err))
}

// setInterval(gatherData, 60000);

//delete data older than 1 year
// client.query(`DELETE FROM price_data
// WHERE date < (EXTRACT(EPOCH FROM NOW()) - 31536000) * 1000;`)