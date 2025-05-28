//THIS IS TO CACHE THE ANALYSIS PAGE FOR EACH SUBSYSTEM

const cron = require('node-cron');
const axios = require('axios');
const { Client } = require('pg');
const { namesAndIds, materialsNamesAndIds } = require('./namesAndIds.js');

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

client.connect();

const dropTable = () => {
    client.query(`DROP TABLE IF EXISTS analysis_snapshot;`)
        .then(() => {
            console.log('Dropped analysis_snapshot');
        })
        .catch((err) => {
            console.log(err);
        })
}

// dropTable();

const calculateMedian = (arr) => {
    const sorted = arr.slice().map(Number).sort((a, b) => a - b); // Ensure all elements are numbers
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
};

function getRegionName(regionId) {
    const regionMap = {
        '10000002': 'Jita',
        '10000043': 'Amarr',
        '10000030': 'Rens',
        '10000042': 'Hek',
        '10000032': 'Dodixie'
    };
    return regionMap[regionId] || 'Unknown';
}

const getTradeVolumeData = async (id, region) => {
    try {
        const response = await axios.get(`https://esi.evetech.net/latest/markets/${region}/history/?type_id=${id}`);
        return response.data;
    }
    catch (error) {
        return [];
    }
}


const updateChartSnapshotTable = async (region, date, dateValues, oneYearAgo, thirtyDaysAgo) => {
    const regionName = getRegionName(region);
    try {
        const subsystems = namesAndIds;
        const length = subsystems.length;
        for (let i = 0; i < length; i++) {
            const { id, name } = subsystems[i];
            const tradeVolumeData = await getTradeVolumeData(id, region);

            if (tradeVolumeData.length === 0) continue;
            client.query(`DELETE FROM analysis_snapshot WHERE region = '${region}' AND type_id = ${id};`);

            tradeVolumeData.forEach((data) => {
                const timestamp = new Date(data.date).getTime();
                data.date = timestamp;
            });
            let tradeValuesArray = [];
            for (let i = 0; i < tradeVolumeData.length; i++) {
                if (tradeVolumeData[i].date < dateValues[0]) {
                    continue;
                } else {
                    tradeValuesArray.push(tradeVolumeData[i]);
                }
            }
            const tradeVolumeLatest = tradeValuesArray[tradeValuesArray.length - 1].volume || 0;
            const lastThirtyDays = tradeValuesArray.filter(data => Number(data.date) >= Number(thirtyDaysAgo));
            const lastThirtyDaysVolume = [];
            lastThirtyDays.forEach(data => {
                lastThirtyDaysVolume.push(data.volume);
            });
            const medianTradeVolume = calculateMedian(lastThirtyDaysVolume);
            let tradePercentageChange;
            if (medianTradeVolume > 0) {
                tradePercentageChange = ((tradeVolumeLatest - medianTradeVolume) / medianTradeVolume) * 100;
            } else if (tradeVolumeLatest > 0) {
                tradePercentageChange = 100;
            } else {
                tradePercentageChange = 0;
            }
            tradePercentageChange = Number(tradePercentageChange).toFixed(1);

            let values = [];
            for (let i = 0; i < tradeValuesArray.length; i++) {
                const data = tradeValuesArray[i];
                values.push(`(${data.date}, ${region}, ${id}, ${data.volume}, ${tradePercentageChange})`);
            }

            if (values.length > 0) {
                const insertQuery = `
                    INSERT INTO analysis_snapshot (date, region, type_id, trade_volume, trade_volume_percent)
                    VALUES ${values.join(', ')}
                `;
                await client.query(insertQuery);
            }
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

const updateTradeVolumeSnapshotTable = async () => {
    const date = new Date(Date.now());
    const regions = ['10000002', '10000043', '10000030', '10000042', '10000032'];
    const lastNight = date.setUTCHours(0, 0, 0, 0);
    let oneYearAgo = new Date(date - (365 * 24 * 60 * 60 * 1000)).setUTCHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(date - (30 * 24 * 60 * 60 * 1000)).setUTCHours(0, 0, 0, 0);
    const dateValues = [];
    let increment = oneYearAgo;
    while (increment < lastNight) {
        increment += 24 * 60 * 60 * 1000; // Increment by one day
        dateValues.push(increment);
    }
    // regions.forEach(region => updateChartSnapshotTable(region, date, dateValues, oneYearAgo, thirtyDaysAgo));
    for (const region of regions) {
        await updateChartSnapshotTable(region, date, dateValues, oneYearAgo, thirtyDaysAgo);
    }
}

module.exports = {
    updateTradeVolumeSnapshotTable
};