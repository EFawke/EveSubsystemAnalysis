const axios = require('axios');
const { Client } = require('pg');
const { namesAndIds, subsystemIDArr } = require('./namesAndIds.js');

let client;
let queueId = "";
if (!process.env.DATABASE_URL) {
    client = new Client()
    queueId = "esalocal";
} else {
    queueId = "evesubsystemanalysis";
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

// dropTable();

//make a database table to store the data
client.query(`CREATE TABLE IF NOT EXISTS subsystems (
        assocKill BIGINT, 
        killTime TIMESTAMP, 
        location VARCHAR(255), 
        type_id BIGINT, 
        type_name VARCHAR(255))`)

//function to make the api call to zkillboard
const axiosZkillData = () => {
    //console.log("fetching data from zkillboard");
    axios(`https://redisq.zkillboard.com/listen.php?queueID=${queueId}&ttw=1`, {
        headers: {
            'accept-encoding': 'gzip',
            'user-agent': 'Johnson Kanjus - evesubsystemanalysis.com - teduardof@gmail.com',
            'connection': 'close'
        }
    })
        .catch(err => {
            if (err) {
                console.log(err)
                return;
            }
        })
        .then(response => {
            if (!response) {
                return;
            }
            if (!response.data) {
                return;
            }
            if (response.data.package === null) {
                return;
            }
            if (response && response.data.package !== null && response.data.package !== undefined && response.data.package.zkb.labels !== null) {
                const items = response.data.package.killmail.victim.items;
                let loc = "";
                if (response.data.package.zkb.labels[3]) {
                    loc = response.data.package.zkb.labels[3];
                };
                loc = loc.substring(4);
                // console.log(items);
                let subsystemCount = 0;
                for (let i = 0; i < items.length; i++) {
                    if (subsystemIDArr.includes(items[i].item_type_id)) {
                        subsystemCount++;
                        const itemTypeId = items[i].item_type_id;
                        const assocKill = response.data.package.killmail.killmail_id;
                        const killTime = response.data.package.killmail.killmail_time;
                        const location = loc;
                        insertKillIntoDatabase(itemTypeId, assocKill, killTime, location);
                    }
                }
                if (subsystemCount === 0 && queueId === "esalocal") {
                    console.log("No subsystems found in this killmail " + response.data.package.killmail.killmail_id);
                }
            }
        });

}

const insertKillIntoDatabase = (itemTypeId, assocKill, killTime, location) => {
    for (let i = 0; i < namesAndIds.length; i++) {
        if (namesAndIds[i].id === itemTypeId) {
            const itemTypeName = namesAndIds[i].name;
            console.log("subsystem: " + itemTypeName + " found!");
            console.log(itemTypeId + " " + assocKill + " " + killTime + " " + location + " " + itemTypeName);
            client.query(`INSERT INTO subsystems (assocKill, killTime, location, type_id, type_name) VALUES (${assocKill}, '${killTime}', '${location}', ${itemTypeId}, '${itemTypeName}')`)
                .catch((err) => {
                    console.log(err);
                })
        }
    }
}

setInterval(axiosZkillData, 1000);