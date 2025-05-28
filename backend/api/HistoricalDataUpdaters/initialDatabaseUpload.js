const { namesAndIds, materialsNamesAndIds } = require('../utils/namesAndIds.js');
const { fetchData } = require('./utils.js');
const axios = require('axios');

const initialDatabaseUpdate = async (client) => {
    fetchData(namesAndIds, client, axios); // fetch subsystems and update prices
    fetchData(materialsNamesAndIds, client, axios); // fetch materials and update prices
}

module.exports = { initialDatabaseUpdate };