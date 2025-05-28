const express = require('express');
const axios = require('axios');
const buildRouter = express.Router();
const { Client } = require('pg');
const { getMaterialRequirements } = require('../MaterialCalculator/getMaterialRequirements.js');
const { reactionRequirements, mainComponents, defensive, offensive, propulsion, core, azbel, raitaru, athanor, tatara, getPricePerUnit } = require('../MaterialCalculator/staticVars.js');

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

const componentIds = [30002, 30476, 30464, 30474, 30470, 29992, 29994, 30478, 30008];

client.connect();

buildRouter.use(express.json());

const getBaseQuantity = (blueprints, itemId, totalRuns, coreRuns, defRuns, offRuns, propRuns) => {
    for (let i = 0; i < mainComponents.length; i++) {
        const component = mainComponents[i];
        if (component.type_id == itemId) {
            return component.quantity * totalRuns * blueprints.numRuns;
        }
    }
    if (defensive.specComponents[0].type_id == itemId) {
        return defensive.specComponents[0].quantity * defRuns * blueprints.numRuns;
    }
    if (core.specComponents[0].type_id == itemId) {
        return core.specComponents[0].quantity * coreRuns * blueprints.numRuns;
    }
    if (offensive.specComponents[0].type_id == itemId) {
        return offensive.specComponents[0].quantity * offRuns * blueprints.numRuns;
    }
    if (propulsion.specComponents[0].type_id == itemId) {
        return propulsion.specComponents[0].quantity * propRuns * blueprints.numRuns;
    }
}

const calculateBPCEIV = (item, marketData, blueprints, settings) => {
    const totalRuns = Number(settings.coreVolume) + Number(settings.defensiveVolume) + Number(settings.offensiveVolume) + Number(settings.propulsionVolume);
    let totalBPCCost = 0;
    const itemId = item.id;
    if (componentIds.includes(itemId)) {
        const material = marketData.find(material => material.type_id === itemId);
        if (material) {
            const quantity = getBaseQuantity(blueprints, itemId, totalRuns, Number(settings.coreVolume), Number(settings.defensiveVolume), Number(settings.offensiveVolume), Number(settings.propulsionVolume));
            totalBPCCost += material.adjusted_price * quantity;
        }
    }
    return totalBPCCost;
}

const calculateEIV = (requirements, numRuns, marketData) => {
    let totalCost = 0;
    for (let i = 0; i < requirements.length; i++) {
        const req = requirements[i];
        const material = marketData.find(material => material.type_id === req.type_id);
        if (material) {
            totalCost += material.adjusted_price * req.quantity;
        }
    }

    // return Math.round(totalCost * numRuns);
    return totalCost * numRuns;
}

const getValueFromData = (orderType, array, quantity) => {
    if (orderType == "buy") {
        const sortedArray = array.sort((a, b) => b.price - a.price);
        return sortedArray[0].price * quantity
    }
    if (orderType == "sell") {
        const sortedArray = array.sort((a, b) => a.price - b.price);
        return sortedArray[0].price * quantity
    }
}

const getUnitPriceFromData = (orderType, array) => {
    if (orderType == "buy") {
        const sortedArray = array.sort((a, b) => b.price - a.price);
        return sortedArray[0].price;
    }
    if (orderType == "sell") {
        const sortedArray = array.sort((a, b) => a.price - b.price);
        return sortedArray[0].price;
    }
}

function consolidateByNameInPlace(arr) {
    const map = new Map();

    for (let i = arr.length - 1; i >= 0; i--) {
        const item = arr[i];
        const key = item.name;

        if (map.has(key)) {
            // Accumulate into the first occurrence
            const target = map.get(key);
            target.quantity += item.quantity;
            target.lineTotal += item.lineTotal;

            // Remove the current duplicate from the array
            arr.splice(i, 1);
        } else {
            map.set(key, item);
        }
    }
}

async function getLatestPriceForItem(client, typeId, region, orderType) {
    const column = orderType === 'buy' ? 'maxbuy' : 'minsell';
    const result = await client.query(
        `
        SELECT ${column}
        FROM price_data
        WHERE type_id = $1 AND region = $2
        ORDER BY date DESC
        LIMIT 1
      `,
        [typeId, region]
    );
    return result.rows[0]?.[column] || 0;
}



buildRouter.post('/', async (req, res) => {
    const settings = req.body;

    // console.log(settings);
    const materialRequirements = getMaterialRequirements(settings);

    // axios.get(`https://esi.evetech.net/latest/markets/prices/?datasource=tranquility`).then(async (response) => {
    // get the building costs from schedule
    const response = {
        data: (await client.query('SELECT type_id, adjusted_price FROM esi_prices')).rows
    };

    let totalTax = 0;
    for (let i = 0; i < materialRequirements.schedule.length; i++) {
        const slot = materialRequirements.schedule[i];
        const reaction = reactionRequirements.find(reaction => reaction.type_id === slot.id);

        if (reaction) {
            const calculatedEIV = calculateEIV(reaction.requirements, slot.runs, response.data);
            const formulaReactionCostIndex = settings.reactionCostIndex / 100;
            const systemCostIndex = Math.floor(calculatedEIV * formulaReactionCostIndex);
            const facilityTax = Math.floor(calculatedEIV * settings.reactionFacilityTax / 100);
            const sccSurcharge = Math.floor(calculatedEIV * 0.04);
            totalTax += systemCostIndex + facilityTax + sccSurcharge;
        }
    }
    // eiv for BPC's
    let totalEIVForBPC = 0;
    for (let i = 0; i < materialRequirements.requiredMaterialsForAll.length; i++) {
        const item = materialRequirements.requiredMaterialsForAll[i];
        const calculatedEIV = calculateBPCEIV(item, response.data, materialRequirements.blueprints, settings);
        totalEIVForBPC += Math.round(calculatedEIV);
    }

    const formulaManufacturingCostIndex = Number(settings.buildCostIndex / 100);
    let systemCostIndexTax = Math.floor(totalEIVForBPC * formulaManufacturingCostIndex);
    if (settings.complex == 'Azbel') {
        const reductionFactor = azbel.iskReduction * systemCostIndexTax;
        systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
    }
    if (settings.complex == 'Raitaru') {
        const reductionFactor = raitaru.iskReduction * systemCostIndexTax;
        systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
    }
    const facilityTaxTax = Math.floor(totalEIVForBPC * settings.complexFacilityTax / 100);
    const sccSurchargeTax = Math.floor(totalEIVForBPC * 0.04);
    const BPCTaxTotal = systemCostIndexTax + facilityTaxTax + sccSurchargeTax;
    totalTax += BPCTaxTotal;

    // eiv for components
    if (Number(settings.coreVolume) > 0) {
        let totalEIVForBPO = 0;
        let coreSpecQuantity = materialRequirements.requiredMaterialsForAll.find((item) => item.id == core.specComponents[0].type_id).quantity;
        let array = [];
        for (let i = 0; i < core.specComponents[0].requirements.length; i++) {
            array.push({ id: core.specComponents[0].requirements[i].type_id, quantity: core.specComponents[0].requirements[i].quantity * coreSpecQuantity });
        }

        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            const calculatedEIV = response.data.find(material => material.type_id === item.id).adjusted_price * item.quantity;
            totalEIVForBPO += calculatedEIV;
        }

        let systemCostIndexTax = Math.floor(totalEIVForBPO * formulaManufacturingCostIndex);
        if (settings.complex == 'Azbel') {
            const reductionFactor = azbel.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        if (settings.complex == 'Raitaru') {
            const reductionFactor = raitaru.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        const facilityTaxTax = Math.floor(totalEIVForBPO * settings.complexFacilityTax / 100);
        const sccSurchargeTax = Math.floor(totalEIVForBPO * 0.04);
        const BPOTaxTotal = systemCostIndexTax + facilityTaxTax + sccSurchargeTax;
        totalTax += BPOTaxTotal;
    }

    if (Number(settings.defensiveVolume) > 0) {
        let totalEIVForBPO = 0;
        let defSpecQuantity = materialRequirements.requiredMaterialsForAll.find((item) => item.id == defensive.specComponents[0].type_id).quantity;
        let array = [];
        for (let i = 0; i < defensive.specComponents[0].requirements.length; i++) {
            array.push({ id: defensive.specComponents[0].requirements[i].type_id, quantity: defensive.specComponents[0].requirements[i].quantity * defSpecQuantity });
        }

        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            const calculatedEIV = response.data.find(material => material.type_id === item.id).adjusted_price * item.quantity;
            totalEIVForBPO += calculatedEIV;
        }

        let systemCostIndexTax = Math.floor(totalEIVForBPO * formulaManufacturingCostIndex);
        if (settings.complex == 'Azbel') {
            const reductionFactor = azbel.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        if (settings.complex == 'Raitaru') {
            const reductionFactor = raitaru.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        const facilityTaxTax = Math.floor(totalEIVForBPO * settings.complexFacilityTax / 100);
        const sccSurchargeTax = Math.floor(totalEIVForBPO * 0.04);
        const BPOTaxTotal = systemCostIndexTax + facilityTaxTax + sccSurchargeTax;
        totalTax += BPOTaxTotal;
    }

    if (Number(settings.offensiveVolume) > 0) {
        let totalEIVForBPO = 0;
        let offSpecQuantity = materialRequirements.requiredMaterialsForAll.find((item) => item.id == offensive.specComponents[0].type_id).quantity;
        let array = [];
        for (let i = 0; i < offensive.specComponents[0].requirements.length; i++) {
            array.push({ id: offensive.specComponents[0].requirements[i].type_id, quantity: offensive.specComponents[0].requirements[i].quantity * offSpecQuantity });
        }

        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            const calculatedEIV = response.data.find(material => material.type_id === item.id).adjusted_price * item.quantity;
            totalEIVForBPO += calculatedEIV;
        }

        let systemCostIndexTax = Math.floor(totalEIVForBPO * formulaManufacturingCostIndex);
        if (settings.complex == 'Azbel') {
            const reductionFactor = azbel.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        if (settings.complex == 'Raitaru') {
            const reductionFactor = raitaru.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        const facilityTaxTax = Math.floor(totalEIVForBPO * settings.complexFacilityTax / 100);
        const sccSurchargeTax = Math.floor(totalEIVForBPO * 0.04);
        const BPOTaxTotal = systemCostIndexTax + facilityTaxTax + sccSurchargeTax;
        totalTax += BPOTaxTotal;
    }

    if (Number(settings.propulsionVolume) > 0) {
        let totalEIVForBPO = 0;
        let propSpecQuantity = materialRequirements.requiredMaterialsForAll.find((item) => item.id == propulsion.specComponents[0].type_id).quantity;
        let array = [];
        for (let i = 0; i < propulsion.specComponents[0].requirements.length; i++) {
            array.push({ id: propulsion.specComponents[0].requirements[i].type_id, quantity: propulsion.specComponents[0].requirements[i].quantity * propSpecQuantity });
        }

        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            const calculatedEIV = response.data.find(material => material.type_id === item.id).adjusted_price * item.quantity;
            totalEIVForBPO += calculatedEIV;
        }

        let systemCostIndexTax = Math.floor(totalEIVForBPO * formulaManufacturingCostIndex);
        if (settings.complex == 'Azbel') {
            const reductionFactor = azbel.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        if (settings.complex == 'Raitaru') {
            const reductionFactor = raitaru.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        const facilityTaxTax = Math.floor(totalEIVForBPO * settings.complexFacilityTax / 100);
        const sccSurchargeTax = Math.floor(totalEIVForBPO * 0.04);
        const BPOTaxTotal = systemCostIndexTax + facilityTaxTax + sccSurchargeTax;
        totalTax += BPOTaxTotal;
    }

    if (Number(settings.propulsionVolume) > 0 || Number(settings.offensiveVolume) > 0 || Number(settings.defensiveVolume) > 0 || Number(settings.coreVolume) > 0) {
        let totalEIVForBPO = 0;
        let mainComponentQuantity = materialRequirements.requiredMaterialsForAll.find((item) => item.id == mainComponents[0].type_id).quantity;
        let array = [];
        for (let i = 0; i < mainComponents[0].requirements.length; i++) {
            array.push({ id: mainComponents[0].requirements[i].type_id, quantity: mainComponents[0].requirements[i].quantity * mainComponentQuantity });
        }

        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            const calculatedEIV = response.data.find(material => material.type_id === item.id).adjusted_price * item.quantity;
            totalEIVForBPO += calculatedEIV;
        }

        let systemCostIndexTax = Math.floor(totalEIVForBPO * formulaManufacturingCostIndex);
        if (settings.complex == 'Azbel') {
            const reductionFactor = azbel.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        if (settings.complex == 'Raitaru') {
            const reductionFactor = raitaru.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        const facilityTaxTax = Math.floor(totalEIVForBPO * settings.complexFacilityTax / 100);
        const sccSurchargeTax = Math.floor(totalEIVForBPO * 0.04);
        const BPOTaxTotal = systemCostIndexTax + facilityTaxTax + sccSurchargeTax;
        totalTax += BPOTaxTotal;
    }

    if (Number(settings.propulsionVolume) > 0 || Number(settings.offensiveVolume) > 0 || Number(settings.defensiveVolume) > 0 || Number(settings.coreVolume) > 0) {
        let totalEIVForBPO = 0;
        let mainComponentQuantity = materialRequirements.requiredMaterialsForAll.find((item) => item.id == mainComponents[1].type_id).quantity;
        let array = [];
        for (let i = 0; i < mainComponents[1].requirements.length; i++) {
            array.push({ id: mainComponents[1].requirements[i].type_id, quantity: mainComponents[1].requirements[i].quantity * mainComponentQuantity });
        }

        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            const calculatedEIV = response.data.find(material => material.type_id === item.id).adjusted_price * item.quantity;
            totalEIVForBPO += calculatedEIV;
        }

        let systemCostIndexTax = Math.floor(totalEIVForBPO * formulaManufacturingCostIndex);
        if (settings.complex == 'Azbel') {
            const reductionFactor = azbel.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        if (settings.complex == 'Raitaru') {
            const reductionFactor = raitaru.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        const facilityTaxTax = Math.floor(totalEIVForBPO * settings.complexFacilityTax / 100);
        const sccSurchargeTax = Math.floor(totalEIVForBPO * 0.04);
        const BPOTaxTotal = systemCostIndexTax + facilityTaxTax + sccSurchargeTax;
        totalTax += BPOTaxTotal;
    }

    if (Number(settings.propulsionVolume) > 0 || Number(settings.offensiveVolume) > 0 || Number(settings.defensiveVolume) > 0 || Number(settings.coreVolume) > 0) {
        let totalEIVForBPO = 0;
        let mainComponentQuantity = materialRequirements.requiredMaterialsForAll.find((item) => item.id == mainComponents[2].type_id).quantity;
        let array = [];
        for (let i = 0; i < mainComponents[2].requirements.length; i++) {
            array.push({ id: mainComponents[2].requirements[i].type_id, quantity: mainComponents[2].requirements[i].quantity * mainComponentQuantity });
        }

        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            const calculatedEIV = response.data.find(material => material.type_id === item.id).adjusted_price * item.quantity;
            totalEIVForBPO += calculatedEIV;
        }

        let systemCostIndexTax = Math.floor(totalEIVForBPO * formulaManufacturingCostIndex);
        if (settings.complex == 'Azbel') {
            const reductionFactor = azbel.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        if (settings.complex == 'Raitaru') {
            const reductionFactor = raitaru.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        const facilityTaxTax = Math.floor(totalEIVForBPO * settings.complexFacilityTax / 100);
        const sccSurchargeTax = Math.floor(totalEIVForBPO * 0.04);
        const BPOTaxTotal = systemCostIndexTax + facilityTaxTax + sccSurchargeTax;
        totalTax += BPOTaxTotal;
    }

    if (Number(settings.propulsionVolume) > 0 || Number(settings.offensiveVolume) > 0 || Number(settings.defensiveVolume) > 0 || Number(settings.coreVolume) > 0) {
        let totalEIVForBPO = 0;
        let mainComponentQuantity = materialRequirements.requiredMaterialsForAll.find((item) => item.id == mainComponents[3].type_id).quantity;
        let array = [];
        for (let i = 0; i < mainComponents[3].requirements.length; i++) {
            array.push({ id: mainComponents[3].requirements[i].type_id, quantity: mainComponents[3].requirements[i].quantity * mainComponentQuantity });
        }

        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            const calculatedEIV = response.data.find(material => material.type_id === item.id).adjusted_price * item.quantity;
            totalEIVForBPO += calculatedEIV;
        }

        let systemCostIndexTax = Math.floor(totalEIVForBPO * formulaManufacturingCostIndex);
        if (settings.complex == 'Azbel') {
            const reductionFactor = azbel.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        if (settings.complex == 'Raitaru') {
            const reductionFactor = raitaru.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        const facilityTaxTax = Math.floor(totalEIVForBPO * settings.complexFacilityTax / 100);
        const sccSurchargeTax = Math.floor(totalEIVForBPO * 0.04);
        const BPOTaxTotal = systemCostIndexTax + facilityTaxTax + sccSurchargeTax;
        totalTax += BPOTaxTotal;
    }

    if (Number(settings.propulsionVolume) > 0 || Number(settings.offensiveVolume) > 0 || Number(settings.defensiveVolume) > 0 || Number(settings.coreVolume) > 0) {
        let totalEIVForBPO = 0;
        let mainComponentQuantity = materialRequirements.requiredMaterialsForAll.find((item) => item.id == mainComponents[4].type_id).quantity;
        let array = [];
        for (let i = 0; i < mainComponents[4].requirements.length; i++) {
            array.push({ id: mainComponents[4].requirements[i].type_id, quantity: mainComponents[4].requirements[i].quantity * mainComponentQuantity });
        }

        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            const calculatedEIV = response.data.find(material => material.type_id === item.id).adjusted_price * item.quantity;
            totalEIVForBPO += calculatedEIV;
        }

        let systemCostIndexTax = Math.floor(totalEIVForBPO * formulaManufacturingCostIndex);
        if (settings.complex == 'Azbel') {
            const reductionFactor = azbel.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        if (settings.complex == 'Raitaru') {
            const reductionFactor = raitaru.iskReduction * systemCostIndexTax;
            systemCostIndexTax = Math.floor(systemCostIndexTax - reductionFactor);
        }
        const facilityTaxTax = Math.floor(totalEIVForBPO * settings.complexFacilityTax / 100);
        const sccSurchargeTax = Math.floor(totalEIVForBPO * 0.04);
        const BPOTaxTotal = systemCostIndexTax + facilityTaxTax + sccSurchargeTax;
        totalTax += BPOTaxTotal;
    }

    const maxBuyPromises = materialRequirements.requiredMaterialsForAll
        .filter(item => item.id !== null)
        .map(async item => {
            if (componentIds.includes(item.id)) return 0;

            try {
                const unitPrice = await getLatestPriceForItem(client, item.id, settings.materialsLocation, settings.materialsOrderType);
                const lineTotal = unitPrice * item.quantity;
                item.unitPrice = unitPrice;
                item.lineTotal = lineTotal;
                return lineTotal;
            } catch (error) {
                console.error(`Error fetching price for item ${item.id}:`, error.message);
                return 0;
            }
        });


    const maxBuys = await axios.all(maxBuyPromises)
        .then(results => results.reduce((acc, price) => acc + price, 0))
        .catch(error => {
            console.error("Error aggregating max buy prices:", error);
            return 0;
        });

    materialRequirements.totalTax = totalTax;
    materialRequirements.maxBuys = maxBuys;
    materialRequirements.totalJobCost = maxBuys + totalTax;

    const gasIds = [30375, 30376, 30377, 30370, 30378, 30371, 30372, 30373, 30374];
    const reactionIds = [30311, 30310, 30305, 30303, 30309, 30307, 30306, 30304, 30308]
    const salvageIds = [45662, 30024, 30270, 30269, 30254, 30248, 30271, 45661, 30018, 30022, 30268, 30259, 30021, 30251, 30019, 30258, 45660, 45663, 30252];
    const mineralIds = [37, 40, 36, 38, 35, 34, 39];
    const fuelBlockIds = [21940, 19860, 21100, 20230];

    // Helper function to determine category priority
    const getCategoryPriority = (id) => {
        if (salvageIds.includes(id)) return 1;
        if (gasIds.includes(id)) return 2;
        if (fuelBlockIds.includes(id)) return 3;
        if (mineralIds.includes(id)) return 4;
        return 5; // For "everything else"
    };

    // Sorting the array
    materialRequirements.requiredMaterialsForAll.sort((a, b) => {
        const categoryA = getCategoryPriority(a.id);
        const categoryB = getCategoryPriority(b.id);

        if (categoryA !== categoryB) {
            return categoryA - categoryB; // Sort by category priority
        }
        return a.id - b.id; // Within the same category, sort by ID
    });

    consolidateByNameInPlace(materialRequirements.requiredMaterialsForAll);

    res.send(materialRequirements);
    // });
});

module.exports = buildRouter;
