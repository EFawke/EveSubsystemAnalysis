const axios = require('axios');
const { Client } = require('pg');
const subsystemIDArr = [45622, 45623, 45624, 45625, 45626, 45627, 45628, 45629, 45630, 45631, 45632, 45633, 45586, 45587, 45588, 45589, 45590, 45591, 45592, 45593, 45594, 45595, 45596, 45597, 45610, 45611, 45612, 45613, 45614, 45615, 45616, 45617, 45618, 45619, 45620, 45621, 45598, 45599, 45600, 45601, 45602, 45603, 45604, 45605, 45606, 45607, 45608, 45609]
const namesAndIds = [
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
        console.log("client is down");
        console.log(err);
    })
    .then((res) => {
        //console.log("client is connected");
    })

//make a database table to store the data
client.query('CREATE TABLE IF NOT EXISTS subsystems (assocKill BIGINT, killTime TIMESTAMP, location VARCHAR(255), type_id BIGINT, type_name VARCHAR(255))')
    .catch(err => {
        console.log(err);
    })
    .then((res) => {
        //console.log("subsystems table created");
    })

//function to make the api call to zkillboard
const axiosZkillData = () => {
    //console.log("fetching data from zkillboard");
    axios("https://redisq.zkillboard.com/listen.php?queueID=AnimeTiddies?ttw=1", {
        headers: {
            'accept-encoding': 'gzip',
            'user-agent': 'Johnson Kanjus - evesubsystemanalysis.com - teduardof@gmail.com',
            'connection': 'close'
        }
    })
        .catch(err => {
            if (err) {
                console.log(err);
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
            if (response && response.data.package !== null && response.data.package !== undefined) {
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
            console.log(itemTypeName + " inserted into database");
            client.query(`INSERT INTO subsystems (assocKill, killTime, location, type_id, type_name) VALUES (${assocKill}, '${killTime}', '${location}', ${itemTypeId}, '${itemTypeName}')`)
        }
    }
}

setInterval(axiosZkillData, 1000);