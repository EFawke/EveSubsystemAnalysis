const axios = require('axios');
const { Client } = require('pg');
const { namesAndIds } = require('./namesAndIds.js');
require('dotenv').config();

let client;
let queueId = "";
if (!process.env.DATABASE_URL) {
    client = new Client();
    queueId = process.env.LOCAL_USER_QUEUE;
} else {
    queueId = process.env.PRODUCTION_USER_QUEUE;
    client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        allowExitOnIdle: true
    });
}
client.connect();

// write a function to delete the table
const dropTable = () => {
    client.query(`DROP TABLE IF EXISTS subsystems;`)
        .then(() => {
            console.log('Dropped subsystems');
        })
        .catch((err) => {
            console.log(err);
        })
}

// HAS TO BE OF TYPE NUMBER VERY IMPORTANT NOT STRING!!!
const subsystemIDArr = [45622, 45623, 45624, 45625, 45626, 45627, 45628, 45629, 45630, 45631, 45632, 45633, 45586, 45587, 45588, 45589, 45590, 45591, 45592, 45593, 45594, 45595, 45596, 45597, 45610, 45611, 45612, 45613, 45614, 45615, 45616, 45617, 45618, 45619, 45620, 45621, 45598, 45599, 45600, 45601, 45602, 45603, 45604, 45605, 45606, 45607, 45608, 45609]

// dropTable();

//make a database table to store the data
client.query(`CREATE TABLE IF NOT EXISTS subsystems (
        assocKill BIGINT, 
        killTime BIGINT, 
        location VARCHAR(255), 
        type_id BIGINT, 
        type_name VARCHAR(255))`)

const axiosZkillData = () => {
    axios(`https://redisq.zkillboard.com/listen.php?queueID=${queueId}`, {
        headers: {
            'accept-encoding': 'gzip',
            'user-agent': process.env.USER_AGENT,
            'connection': 'close'
        }
    })
        .then((response) => {
            if (response && response.data.package !== null && response.data.package !== undefined && response.data.package.zkb.labels !== null) {
                const items = response.data.package.killmail.victim.items;
                let loc = "";
                if (response.data.package.zkb.labels[3]) {
                    loc = response.data.package.zkb.labels[3];
                }
                loc = loc.substring(4);
                let subsystemCount = 0;
                for (let i = 0; i < items.length; i++) {
                    if (subsystemIDArr.includes(items[i].item_type_id)) {
                        subsystemCount++;
                        const itemTypeId = Number(items[i].item_type_id);
                        const assocKill = Number(response.data.package.killmail.killmail_id);
                        const killTime = new Date(response.data.package.killmail.killmail_time).getTime();
                        const location = loc;
                        insertKillIntoDatabase(itemTypeId, assocKill, killTime, location);
                    }
                }
                axiosZkillData();
            }
        })
        .catch(err => {
            console.error('Axios error:', err);
        });
};

const insertKillIntoDatabase = (itemTypeId, assocKill, killTime, location) => {
    for (let i = 0; i < namesAndIds.length; i++) {
        if (namesAndIds[i].id === itemTypeId) {
            const itemTypeName = namesAndIds[i].name;
            client.query(`INSERT INTO subsystems (assocKill, killTime, location, type_id, type_name) VALUES (${assocKill}, ${killTime}, '${location}', ${itemTypeId}, '${itemTypeName}')`)
            .catch(err => {
                console.log("Error inserting into database");
                console.log(err)
            });
        }
    }
}

setInterval(axiosZkillData, 15 * 60 * 1000);