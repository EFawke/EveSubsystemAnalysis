const axios = require('axios');
const { Client } = require('pg');
const { namesAndIds } = require('./namesAndIds.js');

let client;
let queueId = "";
if (!process.env.DATABASE_URL) {
    client = new Client({
        user: 'tedfawke',
        host: 'localhost',
        database: 'evesubsystemanalysis_local',
        password: '',
        port: 5432
    });
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

// HAS TO BE OF TYPE NUMBER VERY IMPORTANT NOT STRING!!!

const subsystemIDArr = [45586, 45587, 45588, 45589, 45590, 45591, 45592, 45593, 45594, 45595, 45596, 45597, 45598, 45599, 45600, 45601, 45602, 45603, 45604, 45605, 45606, 45607, 45608, 45609, 45610, 45611, 45612, 45613, 45614, 45615, 45616, 45617, 45618, 45619, 45620, 45621, 45622, 45623, 45624, 45625, 45626, 45627, 45628, 45629, 45630, 45631, 45632, 45633]

client.query(`CREATE TABLE IF NOT EXISTS subsystems (
        assocKill BIGINT, 
        killTime BIGINT, 
        location VARCHAR(255), 
        type_id BIGINT, 
        type_name VARCHAR(255))`)


const fetchKillDataFromESI = async (killmailId, killHash) => {
    const options = {
        method: 'GET',
        url: `https://esi.evetech.net/killmails/${killmailId}/${killHash}`,
        headers: {
            'Accept-Language': '',
            'If-None-Match': '',
            'X-Tenant': '',
            Accept: 'application/json'
        }
    };

    try {
        const { data } = await axios.request(options);
        return data
    } catch (error) {
        console.error(error);
    }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getSequenceFromSequenceJson = async () => {
    try {
        const response = await axios.get(`https://r2z2.zkillboard.com/ephemeral/sequence.json`);
        return response.data.sequence;
    }
    catch (err) {
        console.log("hmm something went wrong here...");
        return false;
    }

}

const getSequenceFile = async (sequence) => {
    try {
        const response = await axios.get(`https://r2z2.zkillboard.com/ephemeral/${sequence}.json`);
        return response;
    } catch (err) {
        console.log("caught an err");
        return false;
    }
}

const listenToR272 = async () => {
    let sequence = await getSequenceFromSequenceJson(); // starting id
    while (true) {
        raw = await getSequenceFile(sequence)
        if (raw?.status == 200) {
            await handleResponse(raw);
            await sleep(200);
            sequence++
        } else {
            await sleep(6000)
        }
    }
}

const handleResponse = async (response) => {
    if (response && response.data.zkb.labels !== null && response.status == 200) {
        const killmailId = response.data.killmail_id;
        const killHash = response.data.hash;

        const data = await fetchKillDataFromESI(killmailId, killHash)
        if (!data || !data?.victim || !data?.victim?.items) {
            return;
        }
        const items = data.victim.items;
        let loc = "";
        if (data.solar_system_id) {
            loc = data.solar_system_id;
        }
        for (let i = 0; i < items.length; i++) {
            if (subsystemIDArr.includes(items[i].item_type_id)) {
                const itemTypeId = Number(items[i].item_type_id);
                const assocKill = Number(data.killmail_id);
                const killTime = new Date(data.killmail_time).getTime();
                const location = loc;
                insertKillIntoDatabase(itemTypeId, assocKill, killTime, location);
            }
        }
    }
}

const insertKillIntoDatabase = (itemTypeId, assocKill, killTime, location) => {
    const name = namesAndIds.find((subsystem) => subsystem.id == itemTypeId).name;
    client.query(`INSERT INTO subsystems (assocKill, killTime, location, type_id, type_name) VALUES (${assocKill}, ${killTime}, '${location}', ${itemTypeId}, '${name}')`)
    .catch(err => {
        console.log("Error inserting into database");
        console.log(err)
    });
}

listenToR272();