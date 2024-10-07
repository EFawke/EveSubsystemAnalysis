const { Client } = require('pg');

let client;

if (!process.env.DATABASE_URL) {
    client = new Client({
        user: 'tedfawke',        // Your local PostgreSQL username
        host: 'localhost',       // Host should be localhost for local development
        database: 'evesubsystemanalysis_local',  // Your local database name
        password: '',            // Local password if needed (empty if not used)
        port: 5432               // Default PostgreSQL port
    });
} else {
    client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
}

const shipTableInit = () => {
    client.connect();
    client.query(`CREATE TABLE IF NOT EXISTS ship_types(
      ship_class_id integer PRIMARY KEY,
      ship_class_name TEXT NOT NULL);`, (err, res) => {
        if (err) {
            console.log('WHAP WHAP')
            console.log(err);
        } else {
            console.log('this part fine')
        }
        client.end();
    });
}

module.exports = shipTableInit;
