const {
    azbel,
    raitaru,
    mediumManufacturingMaterialRigI,
    mediumManufacturingMaterialRigII,
    largeManufacturingRigI,
    largeManufacturingRigII} = require('./staticVars.js');

const getMaterialEfficiencyBonus = (BPOME, BPOTE, structure, rigOne, rigTwo, location, settings) => {
    let struct;
    if (structure == "Azbel") {
        struct = azbel;
    }
    if (structure == "Raitaru") {
        struct = raitaru;
    }

    const structME = struct.materialReduction;

    let rigME;
    if (structure == "Azbel") {
        if (settings.complexLargeRig == "T1") {
            rigME = largeManufacturingRigI;
        }
        if (settings.complexLargeRig == "T2") {
            rigME = largeManufacturingRigII;
        }
        if (settings.complexLargeRig == "None") {
            rigME = {
                materialReduction: 0,
                timeReduction: 0,
                highsecBonus: 0,
                lowsecBonus: 0,
                nullsecBonus: 0,
                wormholeBonus: 0
            }
        }
    }
    if (structure == "Raitaru") {
        if (settings.complexMeRig == "T1") {
            rigME = mediumManufacturingMaterialRigI;
        }
        if (settings.complexMeRig == "T2") {
            rigME = mediumManufacturingMaterialRigII;
        }
        if (settings.complexMeRig == "None") {
            rigME = {
                materialReduction: 0,
                timeReduction: 0,
                highsecBonus: 0,
                lowsecBonus: 0,
                nullsecBonus: 0,
                wormholeBonus: 0
            }
        }
    }

    const rigMaterialReduction = rigME.materialReduction;
    let locationBonus;
    if (location == "wormhole") {
        locationBonus = rigME.wormholeBonus;
    }
    if (location == "highsec") {
        locationBonus = rigME.highsecBonus;
    }
    if (location == "lowsec") {
        locationBonus = rigME.lowsecBonus;
    }
    if (location == "nullsec") {
        locationBonus = rigME.nullsecBonus;
    }

    const materialEfficiencyBonus = ((1 - (BPOME / 100)) * (1 - structME) * (1 - (rigMaterialReduction * locationBonus)))

    return materialEfficiencyBonus;
}

module.exports = { getMaterialEfficiencyBonus };