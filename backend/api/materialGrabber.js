const axios = require('axios');
const { Client } = require('pg');
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
    .catch(err => {
        console.log(err);
    })
    .then((res) => {
        console.log("material grabber is connected")
    })

const makeTable = () => {
    client.query(`CREATE TABLE IF NOT EXISTS market_data (id BIGSERIAL, itemID BIGINT, name VARCHAR(255), amarr_buy VARCHAR(255), amarr_sell VARCHAR(255), amarr_buy_orders BIGINT, amarr_buy_volume BIGINT, amarr_sell_orders BIGINT, amarr_sell_volume BIGINT, jita_buy VARCHAR(255), jita_sell VARCHAR(255), jita_buy_orders BIGINT, jita_buy_volume BIGINT, jita_sell_orders BIGINT, jita_sell_volume BIGINT, date TIMESTAMP, manufacture_cost_jita VARCHAR(255), manufacture_cost_amarr VARCHAR(255))`)
        .catch(err => {
            console.log(err);
        })
        .then((res) => {
            //console.log("table is created");
        })
}

makeTable();
const grabMaterialData = () => {
    const date = new Date();
    for (let i = 0; i < subsystemIDArr.length; i++) {
        const id = subsystemIDArr[i].id;
        const name = subsystemIDArr[i].name;
        const location = [];
        location.push(axios.get(`https://evetycoon.com/api/v1/market/stats/10000002/${id}`))
        location.push(axios.get(`https://evetycoon.com/api/v1/market/stats/10000043/${id}`))
        location.push(axios.get(`https://www.fuzzwork.co.uk/blueprint/api/blueprint.php?typeid=${id}`))
        axios.all(location)
            .then((result) => {
                if(result[0].data.minSell == null){
                    console.log("no data for this item");
                    return;
                }
                //need to make sure that the data about prices is actually getting inserted into the table
                const buildPrice = result[2].data.blueprintDetails.adjustedPrice;
                const subName = result[2].data.blueprintDetails.productTypeName;
                let resultsData = {};
                //have to merge the two results together and label them with the correct market
                for (let i = 0; i < result.length; i++) {
                    if (i == 0) {
                        let jitaData = {};
                        jitaData.data = result[i].data;
                        jitaData.market = "jita";
                        resultsData.jitaData = jitaData;
                    }
                    if(i == 1) {
                        let amarrData = {};
                        amarrData.data = result[i].data;
                        amarrData.market = "amarr";
                        resultsData.amarrData = amarrData;
                    }
                }
                resultsData.id = id;
                resultsData.name = name;
                resultsData.date = date;
                resultsData.buildPrice = buildPrice;
                insertIntoTable(resultsData)
            })
            .catch(err => {
                console.log(err);
                return;
            })
    }
}

const insertIntoTable = (res) => {
    console.log(res)
    const sql = `INSERT INTO market_data (
        itemid, 
        name, 
        amarr_buy, 
        amarr_sell, 
        amarr_buy_orders, 
        amarr_buy_volume, 
        amarr_sell_orders, 
        amarr_sell_volume, 
        jita_buy,
        jita_sell, 
        jita_buy_orders, 
        jita_buy_volume, 
        jita_sell_orders, 
        jita_sell_volume, 
        date, 
        manufacture_cost_jita, 
        manufacture_cost_amarr) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 ,$11, $12, $13, $14, $15, $16, $17)`;
    const values = [
        res.id,
        res.name,
        res.amarrData.data.maxBuy,
        res.amarrData.data.minSell,
        res.amarrData.data.buyOrders,
        res.amarrData.data.buyVolume,
        res.amarrData.data.sellOrders,
        res.amarrData.data.sellVolume,
        res.jitaData.data.maxBuy,
        res.jitaData.data.minSell,
        res.jitaData.data.buyOrders,
        res.jitaData.data.buyVolume,
        res.jitaData.data.sellOrders,
        res.jitaData.data.sellVolume,
        res.date,
        res.buildPrice,
        res.buildPrice
    ]
    client.query(sql, values)
        .then((res) => {
            // console.log(res)
        })
        .catch(err => {
            console.log(err);
        })
}

//log market data to the console
const logMarketData = () => {
    const sql = "SELECT * FROM market_data";
    client.query(sql)
        .then((res) => {
            console.log(res.rows)
        })
        .catch(err => {
            console.log(err);
        })
}

logMarketData()

grabMaterialData()

const thirtyMinutes = 3600000;

setInterval(grabMaterialData, thirtyMinutes);