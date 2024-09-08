const axios = require('axios');
const { Client } = require('pg');
const { namesAndIds, subsystemIDArr } = require('./namesAndIds.js');

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

// client.query(`SELECT * FROM subsystems`)
//     .then(res => console.log(res.rows));

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
    axios("https://redisq.zkillboard.com/listen.php?queueID=subsystemanalysis?ttw=1", {
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
            if(!response.data){
                return;
            }
            if (response.data.package === null) {
                return;
            }
            if (response && response.data.package !== null && response.data.package !== undefined && response.data.package.zkb.labels !== null) {
                const items = response.data.package.killmail.victim.items;
                let loc = "";
                if(response.data.package.zkb.labels[3]){
                    loc = response.data.package.zkb.labels[3];
                };
                loc = loc.substring(4);
                for(let i = 0; i < items.length; i++){
                    if(subsystemIDArr.includes(items[i].item_type_id)){
                        const itemTypeId = items[i].item_type_id;
                        const assocKill = response.data.package.killmail.killmail_id;
                        const killTime = response.data.package.killmail.killmail_time;
                        const location = loc;
                        lookupSubsystemName(itemTypeId, assocKill, killTime, location);
                    }
                }
            }
        });

}

const lookupSubsystemName = (itemTypeId, assocKill, killTime, location) => {
    for (let i = 0; i < namesAndIds.length; i++) {
        if (namesAndIds[i].id === itemTypeId) {
            const itemTypeName = namesAndIds[i].name;
            client.query(`INSERT INTO subsystems (assocKill, killTime, location, type_id, type_name) VALUES (${assocKill}, '${killTime}', '${location}', ${itemTypeId}, '${itemTypeName}')`)
                .catch((err) => {
                    console.log(err);
                })
        }
    }
}

setInterval(axiosZkillData, 1000);