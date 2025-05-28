const axios = require('axios');
const { Client } = require('pg');

const PRICES_URL = 'https://esi.evetech.net/latest/markets/prices/';

let client;
if (!process.env.DATABASE_URL) {
  client = new Client();
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
  try {
    await client.connect();

    const response = await axios.get(PRICES_URL);
    const prices = response.data;

    if (!Array.isArray(prices) || prices.length === 0) {
      console.warn('Empty or invalid data received from ESI.');
      return;
    }

    const queryText = `
      INSERT INTO esi_prices (type_id, adjusted_price, average_price, last_updated)
      VALUES ($1, $2, $3, now())
      ON CONFLICT (type_id) DO UPDATE SET
        adjusted_price = EXCLUDED.adjusted_price,
        average_price = EXCLUDED.average_price,
        last_updated = now();
    `;

    for (const price of prices) {
      await client.query(queryText, [
        price.type_id,
        price.adjusted_price || 0,
        price.average_price || 0
      ]);
    }

    console.log(`[${new Date().toISOString()}] Stored ${prices.length} prices in DB.`);
  } catch (err) {
    console.error('Failed to fetch and store prices:', err.message);
  } finally {
    await client.end();
  }
}

module.exports = {
  fetchAndStorePrices
};
