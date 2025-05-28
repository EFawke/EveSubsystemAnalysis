const {
    defensive,
    offensive,
    propulsion,
    core,
} = require('./staticVars.js');

const calculateSpecComponentQuantities = (coreRuns, offRuns, propRuns, defRuns, blueprints, structure, rigOne, rigTwo, location, coreRequiredMaterials, defensiveRequiredMaterials, offensiveRequiredMaterials, propulsionRequiredMaterials) => {
    let structureMaterialEfficiencyModifier = 0;

    // Set structure material efficiency modifier
    if (structure == "Azbel" || structure == "Raitaru") {
        structureMaterialEfficiencyModifier = 1 / 100;
    }

    let blueprintCopyMaterialEfficiencyModifier = blueprints.materialEfficiency / 100;
    const totalMEBonus = structureMaterialEfficiencyModifier + blueprintCopyMaterialEfficiencyModifier;
    const efficiencyModifier = 1 - totalMEBonus;

    let coreSpecComponentName = core.specComponents[0].name;
    let coreSpecComponentId = core.specComponents[0].type_id;
    let coreBaseQty = coreRuns * Math.round(core.specComponents[0].quantity * blueprints.numRuns * efficiencyModifier);
    if (coreRuns > 0) {
        coreRequiredMaterials.push({ name: coreSpecComponentName, id: coreSpecComponentId, quantity: coreBaseQty });
    }

    let offSpecComponentName = offensive.specComponents[0].name;
    let offSpecComponentId = offensive.specComponents[0].type_id;
    let offBaseQty = offRuns * Math.round(offensive.specComponents[0].quantity * blueprints.numRuns * efficiencyModifier);
    if (offRuns > 0) {
        offensiveRequiredMaterials.push({ name: offSpecComponentName, id: offSpecComponentId, quantity: offBaseQty });
    }

    let propSpecComponentName = propulsion.specComponents[0].name;
    let propSpecComponentId = propulsion.specComponents[0].type_id;
    let propBaseQty = propRuns * Math.round(propulsion.specComponents[0].quantity * blueprints.numRuns * efficiencyModifier);
    if (propRuns > 0) {
        propulsionRequiredMaterials.push({ name: propSpecComponentName, id: propSpecComponentId, quantity: propBaseQty });
    }

    let defSpecComponentName = defensive.specComponents[0].name;
    let defSpecComponentId = defensive.specComponents[0].type_id;
    let defBaseQty = defRuns * Math.round(defensive.specComponents[0].quantity * blueprints.numRuns * efficiencyModifier);
    if (defRuns > 0) {
        defensiveRequiredMaterials.push({ name: defSpecComponentName, id: defSpecComponentId, quantity: defBaseQty });
    }

    return [
        {
            name: coreSpecComponentName,
            id: coreSpecComponentId,
            quantity: coreBaseQty
        },
        {
            name: offSpecComponentName,
            id: offSpecComponentId,
            quantity: offBaseQty
        },
        {
            name: propSpecComponentName,
            id: propSpecComponentId,
            quantity: propBaseQty
        },
        {
            name: defSpecComponentName,
            id: defSpecComponentId,
            quantity: defBaseQty
        }
    ];
}

module.exports = { calculateSpecComponentQuantities };