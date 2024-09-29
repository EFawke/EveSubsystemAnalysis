const { calculateMainComponentRequirements, calculateSpecComponentRequirements, BPOMaterialEfficiency, reactionRequirements, azbel, raitaru, tatara, athanor, largeReactionRigI, largeReactionRigII, largeManufacturingRigI, largeManufacturingRigII, mainComponents, defensive, getPricePerUnit, mediumManufacturingMaterialRigI, mediumManufacturingMaterialRigII } = require('./staticVars.js');
const { intactArmorNanobots, intactPowerCores, intactWeaponSubroutines, intactThrusterSections, getSuccessChance } = require('./blueprintCalculator.js');

// let structure = "Azbel";
// let rig = "LT1";
// let location = "wormhole";
// let reactionRig = "LT1";
// let reactionLocation = "wormhole";


const getMaterialRequirements = (type, structure, rig, location, reactionRig, reactionLocation) => {
    const numUnits = 22;
    let relicType;
    if (type == "defensive") {
        relicType = intactArmorNanobots;
    }
    if (type == "offensive") {
        relicType = intactWeaponSubroutines;
    }
    if (type == "propulsion") {
        relicType = intactThrusterSections;
    }
    if (type == "core") {
        relicType = intactPowerCores;
    }
    const successChance = getSuccessChance(relicType);
    relicType.successChance = successChance;
    relicType.datacoreQuantity = 3 / successChance;
    relicType.decryptorAndRelicQuantity = 1 / successChance;

    const calculateComponentMME = (structure, rig, location) => {
        let locationModifier;
        let rigModifier;
        let structureModifier;
        let rigType;
        if (structure == "Azbel") {
            structureModifier = azbel.materialReduction;
        }
        if (structure == "Raitaru") {
            structureModifier = raitaru.materialRecution;
        }
        if (rig == "LT1") {
            rigType = largeManufacturingRigI;
            rigModifier = largeManufacturingRigI.materialReduction;
        }
        if (rig == "LT2") {
            rigType = largeManufacturingRigII;
            rigModifier = largeManufacturingRigII.materialReduction;
        }
        if (rig == "MT1ME") {
            rigType = mediumManufacturingMaterialRigI;
            rigModifier = mediumManufacturingMaterialRigI.materialReduction;
        }
        if (rig == "MT2ME") {
            rigType = mediumManufacturingMaterialRigII;
            rigModifier = mediumManufacturingMaterialRigII.materialReduction;
        }
        if (rig == null) {
            rigType = null;
            rigModifier = 0;
            locationModifier = 0;
        }
        if (location == "wormhole" || location == "nullsec") {
            locationModifier = rigType?.wormholeBonus;
        }
        if (location == "lowsec") {
            locationModifier = rigType?.lowsecBonus;
        }
        if (location == "highsec") {
            locationModifier = rigType?.highsecBonus;
        }

        const efficiency = ((1 - .1) * (1 - structureModifier) * (1 - (rigModifier * locationModifier)))
        return efficiency;
    };

    //component manufacturing material efficiency bonus
    const materialEfficiencyBonus = calculateComponentMME(structure, rig, location);

    const totalSalvageRequired = [];
    const reactionsQuantities = [];
    const gasRequirements = [];

    // main components
    calculateMainComponentRequirements(mainComponents, numUnits, materialEfficiencyBonus, totalSalvageRequired, reactionsQuantities);

    // spec components
    calculateSpecComponentRequirements(defensive, numUnits, materialEfficiencyBonus, totalSalvageRequired, reactionsQuantities);

    // num runs
    for (let i = 0; i < reactionsQuantities.length; i++) {
        reactionsQuantities[i].runs = Math.ceil(reactionsQuantities[i].quantity / reactionsQuantities[i].output);
    };

    //get reactor efficiency
    const reactorEfficiency = calculateReactionMME(structure, reactionRig, reactionLocation);

    //get gas requirements
    for (let i = 0; i < reactionsQuantities.length; i++) {
        const runs = reactionsQuantities[i].runs
        for (let j = 0; j < reactionsQuantities[i].requirements.length; j++) {
            const existingItem = gasRequirements.find(item => item.type_id === reactionsQuantities[i].requirements[j].type_id);
            if (existingItem) {
                newQty = Math.ceil((reactionsQuantities[i].requirements[j].quantity * runs) * reactorEfficiency);
                existingItem.quantity += newQty;
            } else {
                newQty = Math.ceil((reactionsQuantities[i].requirements[j].quantity * runs) * reactorEfficiency);
                gasRequirements.push({
                    type_id: reactionsQuantities[i].requirements[j].type_id,
                    name: reactionsQuantities[i].requirements[j].name,
                    quantity: newQty
                });
            }
        }
    };

    gasRequirements.sort((a, b) => a.type_id - b.type_id);

    let output = {
        salvage: totalSalvageRequired,
        reactionReqs: gasRequirements,
        relicType: relicType
    };

    return output;
}

module.exports = getMaterialRequirements;