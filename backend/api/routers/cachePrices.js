const axios = require('axios');
const { Client } = require('pg');
const { namesAndIds, materialsNamesAndIds } = require('../utils/namesAndIds');

const PRICES_URL = 'https://esi.evetech.net/latest/markets/prices/';

let client;
if (!process.env.DATABASE_URL) {
  client = new Client({
    user: 'tedfawke',
    host: 'localhost',
    database: 'evesubsystemanalysis_local',
    password: '',
    port: 5432
  });
} else {
  client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    allowExitOnIdle: true
  });
}

async function fetchAndStorePrices() {
  const vals = [];
  const subIds = namesAndIds.map((item) => item.id);
  const matIds = materialsNamesAndIds.map((item) => item.id);

  const allIds = [...subIds, ...matIds];
 
  try {
    await client.connect();

    const response = await axios.get(PRICES_URL);
    const prices = response.data;

    if (!Array.isArray(prices) || prices.length === 0) {
      console.warn('Empty or invalid data received from ESI.');
      return;
    }

    for (const price of prices) {
      if(allIds.includes(price.type_id)){
        vals.push(`(${price.type_id}, ${price.adjusted_price || 0}, ${price.average_price || 0}, to_timestamp(${Date.now()} / 1000))`);
      }
    }
    const queryText = `
      INSERT INTO esi_prices (type_id, adjusted_price, average_price, last_updated)
      VALUES ${vals}
      ON CONFLICT (type_id) DO UPDATE SET
        adjusted_price = EXCLUDED.adjusted_price,
        average_price = EXCLUDED.average_price,
        last_updated = now();
    `;
    await client.query(queryText);
  } catch (err) {
    console.error('Failed to fetch and store prices:', err.message);
  }
  finally{
    console.log(`[${new Date().toISOString()}] esi update`);
    await client.end();
  }
}

module.exports = {
  fetchAndStorePrices
};
