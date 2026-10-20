const {
    mediumReactionMaterialRigI,
    mediumReactionMaterialRigII,
    largeReactionRigI,
    largeReactionRigII} = require('./staticVars.js');

const calculateReactorMEEfficiency = (
    reactionStructure, 
    reactionRigOne, 
    reactionRigTwo, 
    tataraRig,
    reactionLocation, 
    settings
) => {
    let rigME;
    if (reactionStructure == "Athanor") {
        if (reactionRigOne == "T1") {
            rigME = mediumReactionMaterialRigI;
        }
        if (reactionRigOne == "T2") {
            rigME = mediumReactionMaterialRigII;
        }
        if (reactionRigOne == "None") {
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
    if (reactionStructure == "Tatara") {
        if (tataraRig == "T1") {
            rigME = largeReactionRigI;
        }
        if (tataraRig == "T2") {
            rigME = largeReactionRigII;
        }
        if (tataraRig == "None") {
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
    if (reactionLocation == "wormhole") {
        locationBonus = rigME.wormholeBonus;
    }
    if (reactionLocation == "lowsec") {
        locationBonus = rigME.lowsecBonus;
    }
    if (reactionLocation == "nullsec") {
        locationBonus = rigME.nullsecBonus;
    }

    const reactorEfficiency = 1 - (rigMaterialReduction * locationBonus);

    return reactorEfficiency;
}

module.exports = { calculateReactorMEEfficiency };