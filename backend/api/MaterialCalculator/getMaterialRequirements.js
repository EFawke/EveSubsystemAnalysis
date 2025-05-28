//ok this code is pretty fucked honestly
//but I wrote it like this because it would've been impossible to keep it all in my head

const {
    mainComponents,
    defensive,
    offensive,
    propulsion,
    core,
    intactArmorNanobots,
    intactPowerCores,
    intactWeaponSubroutines,
    intactThrusterSections,
    malfunctioningArmorNanobots,
    malfunctioningPowerCores,
    malfunctioningWeaponSubroutines,
    malfunctioningThrusterSections,
    wreckedArmorNanobots,
    wreckedPowerCores,
    wreckedWeaponSubroutines,
    wreckedThrusterSections
} = require('./staticVars.js');
const { scheduleReactions } = require('./scheduleReactions.js');
const { invent } = require('./invent.js');
const { calculateSpecComponentQuantities } = require('./calculateSpecComponentQuantities.js');
const { getMaterialEfficiencyBonus } = require('./getMaterialEfficiencyBonus.js');
const { calculateReactorMEEfficiency } = require('./calculateReactorMEEfficiency.js');
const { aggregateItems } = require('./aggregateItems.js');
const { materialsNamesAndIds } = require('../utils/namesAndIds.js');

const getMaterialRequirements = (settings) => {
    let structure = settings.complex;
    let rigOne = settings.complexMeRig || "None";
    let rigTwo = settings.complexTeRig || "None";
    let location = settings.complexSystem || "wormhole";

    let reactionStructure = settings.refinery;
    let reactionRigOne = settings.meRig || "None";
    let reactionRigTwo = settings.teRig || "None";
    let reactionLocation = settings.system || "wormhole";

    let BPOME = settings.componentMaterialEfficiency ?? 10;
    let BPOTE = settings.componentTimeEfficiency ?? 20;

    let relicType = settings.ancientRelic || "Intact";
    let decryptor = settings.decryptor || "None";

    let coreRuns = settings.coreVolume == "" ? 0 : settings.coreVolume;
    let offRuns = settings.offensiveVolume == "" ? 0 : settings.offensiveVolume;
    let propRuns = settings.propulsionVolume == "" ? 0 : settings.propulsionVolume;
    let defRuns = settings.defensiveVolume == "" ? 0 : settings.defensiveVolume;

    let reactionSlots = settings.numSlots || 1;
    let skillLevel = settings.skillLevel ?? 1;
    let implantBonus = settings.implant;

    let requiredMaterials = [];

    let coreRequiredMaterials = [];
    let defensiveRequiredMaterials = [];
    let offensiveRequiredMaterials = [];
    let propulsionRequiredMaterials = [];

    // console.log(settings);

    const blueprints = invent(relicType, decryptor, skillLevel, coreRuns, offRuns, propRuns, defRuns)

    // add the mats needed for invention to the requiredMaterials array
    if (coreRuns > 0) {
        let coreRelic;
        if (relicType === "Intact") {
            coreRelic = intactPowerCores;
        }
        else if (relicType === "Malfunctioning") {
            coreRelic = malfunctioningPowerCores;
        }
        else if (relicType === "Wrecked") {
            coreRelic = wreckedPowerCores;
        }
        const dataCoreOneId = coreRelic.datacoreOne;
        const dataCoreOneName = materialsNamesAndIds.find((element) => element.id === dataCoreOneId).name;
        const dataCoreQuantity = blueprints.coreRuns * 3;

        const dataCoreTwoId = coreRelic.datacoreTwo;
        const dataCoreTwoName = materialsNamesAndIds.find((element) => element.id === dataCoreTwoId).name;
        const dataCoreTwoQuantity = blueprints.coreRuns * 3;

        const relicName = coreRelic.typeName;
        const relicId = coreRelic.typeId;
        const relicQuantity = blueprints.coreRuns;

        const decryptorName = blueprints.decryptor.typeName;
        const decryptorId = blueprints.decryptor.typeId;
        const decryptorQuantity = blueprints.coreRuns;

        requiredMaterials.push({ name: dataCoreOneName, id: dataCoreOneId, quantity: dataCoreQuantity });
        coreRequiredMaterials.push({ name: dataCoreOneName, id: dataCoreOneId, quantity: dataCoreQuantity });
        requiredMaterials.push({ name: dataCoreTwoName, id: dataCoreTwoId, quantity: dataCoreTwoQuantity });
        coreRequiredMaterials.push({ name: dataCoreTwoName, id: dataCoreTwoId, quantity: dataCoreTwoQuantity });
        requiredMaterials.push({ name: relicName, id: relicId, quantity: relicQuantity });
        coreRequiredMaterials.push({ name: relicName, id: relicId, quantity: relicQuantity });
        requiredMaterials.push({ name: decryptorName, id: decryptorId, quantity: decryptorQuantity });
        coreRequiredMaterials.push({ name: decryptorName, id: decryptorId, quantity: decryptorQuantity });
    }

    if (defRuns > 0) {
        let defRelic;
        if (relicType === "Intact") {
            defRelic = intactArmorNanobots;
        }
        else if (relicType === "Malfunctioning") {
            defRelic = malfunctioningArmorNanobots;
        }
        else if (relicType === "Wrecked") {
            defRelic = wreckedArmorNanobots;
        }
        const dataCoreOneId = defRelic.datacoreOne;
        const dataCoreOneName = materialsNamesAndIds.find((element) => element.id === dataCoreOneId).name;
        const dataCoreQuantity = blueprints.defRuns * 3;

        const dataCoreTwoId = defRelic.datacoreTwo;
        const dataCoreTwoName = materialsNamesAndIds.find((element) => element.id === dataCoreTwoId).name;
        const dataCoreTwoQuantity = blueprints.defRuns * 3;

        const relicName = defRelic.typeName;
        const relicId = defRelic.typeId;
        const relicQuantity = blueprints.defRuns;

        const decryptorName = blueprints.decryptor.typeName;
        const decryptorId = blueprints.decryptor.typeId;
        const decryptorQuantity = blueprints.defRuns;

        requiredMaterials.push({ name: dataCoreOneName, id: dataCoreOneId, quantity: dataCoreQuantity });
        defensiveRequiredMaterials.push({ name: dataCoreOneName, id: dataCoreOneId, quantity: dataCoreQuantity });
        requiredMaterials.push({ name: dataCoreTwoName, id: dataCoreTwoId, quantity: dataCoreTwoQuantity });
        defensiveRequiredMaterials.push({ name: dataCoreTwoName, id: dataCoreTwoId, quantity: dataCoreTwoQuantity });
        requiredMaterials.push({ name: relicName, id: relicId, quantity: relicQuantity });
        defensiveRequiredMaterials.push({ name: relicName, id: relicId, quantity: relicQuantity });
        requiredMaterials.push({ name: decryptorName, id: decryptorId, quantity: decryptorQuantity });
        defensiveRequiredMaterials.push({ name: decryptorName, id: decryptorId, quantity: decryptorQuantity });
    }

    if (propRuns > 0) {
        let propRelic;
        if (relicType === "Intact") {
            propRelic = intactThrusterSections;
        }
        else if (relicType === "Malfunctioning") {
            propRelic = malfunctioningThrusterSections;
        }
        else if (relicType === "Wrecked") {
            propRelic = wreckedThrusterSections;
        }
        const dataCoreOneId = propRelic.datacoreOne;
        const dataCoreOneName = materialsNamesAndIds.find((element) => element.id === dataCoreOneId).name;
        const dataCoreQuantity = blueprints.propRuns * 3;

        const dataCoreTwoId = propRelic.datacoreTwo;
        const dataCoreTwoName = materialsNamesAndIds.find((element) => element.id === dataCoreTwoId).name;
        const dataCoreTwoQuantity = blueprints.propRuns * 3;

        const relicName = propRelic.typeName;
        const relicId = propRelic.typeId;
        const relicQuantity = blueprints.propRuns;

        const decryptorName = blueprints.decryptor.typeName;
        const decryptorId = blueprints.decryptor.typeId;
        const decryptorQuantity = blueprints.propRuns;

        requiredMaterials.push({ name: dataCoreOneName, id: dataCoreOneId, quantity: dataCoreQuantity });
        propulsionRequiredMaterials.push({ name: dataCoreOneName, id: dataCoreOneId, quantity: dataCoreQuantity });
        requiredMaterials.push({ name: dataCoreTwoName, id: dataCoreTwoId, quantity: dataCoreTwoQuantity });
        propulsionRequiredMaterials.push({ name: dataCoreTwoName, id: dataCoreTwoId, quantity: dataCoreTwoQuantity });
        requiredMaterials.push({ name: relicName, id: relicId, quantity: relicQuantity });
        propulsionRequiredMaterials.push({ name: relicName, id: relicId, quantity: relicQuantity });
        requiredMaterials.push({ name: decryptorName, id: decryptorId, quantity: decryptorQuantity });
        propulsionRequiredMaterials.push({ name: decryptorName, id: decryptorId, quantity: decryptorQuantity });
    }

    if (offRuns > 0) {
        let offRelic;
        if (relicType === "Intact") {
            offRelic = intactWeaponSubroutines;
        }
        else if (relicType === "Malfunctioning") {
            offRelic = malfunctioningWeaponSubroutines;
        }
        else if (relicType === "Wrecked") {
            offRelic = wreckedWeaponSubroutines;
        }
        const dataCoreOneId = offRelic.datacoreOne;
        const dataCoreOneName = materialsNamesAndIds.find((element) => element.id === dataCoreOneId).name;
        const dataCoreQuantity = blueprints.offRuns * 3;

        const dataCoreTwoId = offRelic.datacoreTwo;
        const dataCoreTwoName = materialsNamesAndIds.find((element) => element.id === dataCoreTwoId).name;
        const dataCoreTwoQuantity = blueprints.offRuns * 3;

        const relicName = offRelic.typeName;
        const relicId = offRelic.typeId;
        const relicQuantity = blueprints.offRuns;

        const decryptorName = blueprints.decryptor.typeName;
        const decryptorId = blueprints.decryptor.typeId;
        const decryptorQuantity = blueprints.offRuns;

        requiredMaterials.push({ name: dataCoreOneName, id: dataCoreOneId, quantity: dataCoreQuantity });
        offensiveRequiredMaterials.push({ name: dataCoreOneName, id: dataCoreOneId, quantity: dataCoreQuantity });
        requiredMaterials.push({ name: dataCoreTwoName, id: dataCoreTwoId, quantity: dataCoreTwoQuantity });
        offensiveRequiredMaterials.push({ name: dataCoreTwoName, id: dataCoreTwoId, quantity: dataCoreTwoQuantity });
        requiredMaterials.push({ name: relicName, id: relicId, quantity: relicQuantity });
        offensiveRequiredMaterials.push({ name: relicName, id: relicId, quantity: relicQuantity });
        requiredMaterials.push({ name: decryptorName, id: decryptorId, quantity: decryptorQuantity });
        offensiveRequiredMaterials.push({ name: decryptorName, id: decryptorId, quantity: decryptorQuantity });
    }

    const mainComponentsQuantities = blueprints.numRuns * coreRuns + blueprints.numRuns * offRuns + blueprints.numRuns * propRuns + blueprints.numRuns * defRuns;

    const specComponentQuantities = calculateSpecComponentQuantities(coreRuns, offRuns, propRuns, defRuns, blueprints, structure, rigOne, rigTwo, location, coreRequiredMaterials, defensiveRequiredMaterials, offensiveRequiredMaterials, propulsionRequiredMaterials);

    for (let i = 0; i < mainComponents.length; i++) {
        const mainComponentId = mainComponents[i].type_id;
        const mainComponentName = mainComponents[i].name;
        const mainComponentQuantity = mainComponents[i].quantity * mainComponentsQuantities;
        requiredMaterials.push({ name: mainComponentName, id: mainComponentId, quantity: mainComponentQuantity });
        if (coreRuns > 0) {
            coreRequiredMaterials.push({ name: mainComponentName, id: mainComponentId, quantity: mainComponentQuantity / coreRuns });
        }
        if (offRuns > 0) {
            offensiveRequiredMaterials.push({ name: mainComponentName, id: mainComponentId, quantity: mainComponentQuantity / offRuns });
        }
        if (propRuns > 0) {
            propulsionRequiredMaterials.push({ name: mainComponentName, id: mainComponentId, quantity: mainComponentQuantity / propRuns });
        }
        if (defRuns > 0) {
            defensiveRequiredMaterials.push({ name: mainComponentName, id: mainComponentId, quantity: mainComponentQuantity / defRuns });
        }
    }

    for (let i = 0; i < specComponentQuantities.length; i++) {
        requiredMaterials.push(specComponentQuantities[i]);
    }

    const materialEfficiencyBonus = getMaterialEfficiencyBonus(BPOME, BPOTE, settings.complex, rigOne, rigTwo, location, settings);

    // create an array for all of the material requirements
    const totalSalvageRequired = [];
    const reactionsQuantities = [];

    const totalSalvageRequiredForCore = [];
    const reactionsQuantitiesForCore = [];

    const totalSalvageRequiredForOffensive = [];
    const reactionsQuantitiesForOffensive = [];

    const totalSalvageRequiredForPropulsion = [];
    const reactionsQuantitiesForPropulsion = [];

    const totalSalvageRequiredForDefensive = [];
    const reactionsQuantitiesForDefensive = [];

    // main components
    for (let i = 0; i < mainComponents.length; i++) {
        const componentRequirements = mainComponents[i].requirements;
        for (let j = 0; j < componentRequirements.length; j++) {
            if (!componentRequirements[j].requirements) { //salvage
                if (coreRuns > 0) {
                    totalSalvageRequiredForCore.push({ name: componentRequirements[j].name, id: componentRequirements[j].type_id, quantity: 0 });
                }
                if (offRuns > 0) {
                    totalSalvageRequiredForOffensive.push({ name: componentRequirements[j].name, id: componentRequirements[j].type_id, quantity: 0 });
                }
                if (propRuns > 0) {
                    totalSalvageRequiredForPropulsion.push({ name: componentRequirements[j].name, id: componentRequirements[j].type_id, quantity: 0 });
                }
                if (defRuns > 0) {
                    totalSalvageRequiredForDefensive.push({ name: componentRequirements[j].name, id: componentRequirements[j].type_id, quantity: 0 });
                }
                totalSalvageRequired.push({ name: componentRequirements[j].name, id: componentRequirements[j].type_id, quantity: 0 });
            } else {
                if (coreRuns > 0) {
                    reactionsQuantitiesForCore.push({ name: componentRequirements[j].name, id: componentRequirements[j].type_id, quantity: 0, requirements: componentRequirements[j].requirements, output: componentRequirements[j].output });
                }
                if (offRuns > 0) {
                    reactionsQuantitiesForOffensive.push({ name: componentRequirements[j].name, id: componentRequirements[j].type_id, quantity: 0, requirements: componentRequirements[j].requirements, output: componentRequirements[j].output });
                }
                if (propRuns > 0) {
                    reactionsQuantitiesForPropulsion.push({ name: componentRequirements[j].name, id: componentRequirements[j].type_id, quantity: 0, requirements: componentRequirements[j].requirements, output: componentRequirements[j].output });
                }
                if (defRuns > 0) {
                    reactionsQuantitiesForDefensive.push({ name: componentRequirements[j].name, id: componentRequirements[j].type_id, quantity: 0, requirements: componentRequirements[j].requirements, output: componentRequirements[j].output });
                }
                reactionsQuantities.push({ name: componentRequirements[j].name, id: componentRequirements[j].type_id, quantity: 0, requirements: componentRequirements[j].requirements, output: componentRequirements[j].output });
            }
        }
    }

    if (coreRuns > 0) {
        for (let i = 0; i < core.specComponents[0].requirements.length; i++) {
            if (!core.specComponents[0].requirements[i].requirements) { //salvage
                totalSalvageRequiredForCore.push({ name: core.specComponents[0].requirements[i].name, id: core.specComponents[0].requirements[i].type_id, quantity: 0 });
                totalSalvageRequired.push({ name: core.specComponents[0].requirements[i].name, id: core.specComponents[0].requirements[i].type_id, quantity: 0 });
            } else {
                reactionsQuantitiesForCore.push({ name: core.specComponents[0].requirements[i].name, id: core.specComponents[0].requirements[i].type_id, quantity: 0, requirements: core.specComponents[0].requirements[i].requirements, output: core.specComponents[0].requirements[i].output });
                reactionsQuantities.push({ name: core.specComponents[0].requirements[i].name, id: core.specComponents[0].requirements[i].type_id, quantity: 0, requirements: core.specComponents[0].requirements[i].requirements, output: core.specComponents[0].requirements[i].output });
            }
        }
    }

    if (offRuns > 0) {
        for (let i = 0; i < offensive.specComponents[0].requirements.length; i++) {
            if (!offensive.specComponents[0].requirements[i].requirements) { //salvage
                totalSalvageRequiredForOffensive.push({ name: offensive.specComponents[0].requirements[i].name, id: offensive.specComponents[0].requirements[i].type_id, quantity: 0 });
                totalSalvageRequired.push({ name: offensive.specComponents[0].requirements[i].name, id: offensive.specComponents[0].requirements[i].type_id, quantity: 0 });
            } else {
                reactionsQuantitiesForOffensive.push({ name: offensive.specComponents[0].requirements[i].name, id: offensive.specComponents[0].requirements[i].type_id, quantity: 0, requirements: offensive.specComponents[0].requirements[i].requirements, output: offensive.specComponents[0].requirements[i].output });
                reactionsQuantities.push({ name: offensive.specComponents[0].requirements[i].name, id: offensive.specComponents[0].requirements[i].type_id, quantity: 0, requirements: offensive.specComponents[0].requirements[i].requirements, output: offensive.specComponents[0].requirements[i].output });
            }
        }
    }

    if (propRuns > 0) {
        for (let i = 0; i < propulsion.specComponents[0].requirements.length; i++) {
            if (!propulsion.specComponents[0].requirements[i].requirements) { //salvage
                totalSalvageRequiredForPropulsion.push({ name: propulsion.specComponents[0].requirements[i].name, id: propulsion.specComponents[0].requirements[i].type_id, quantity: 0 });
                totalSalvageRequired.push({ name: propulsion.specComponents[0].requirements[i].name, id: propulsion.specComponents[0].requirements[i].type_id, quantity: 0 });
            } else {
                reactionsQuantitiesForPropulsion.push({ name: propulsion.specComponents[0].requirements[i].name, id: propulsion.specComponents[0].requirements[i].type_id, quantity: 0, requirements: propulsion.specComponents[0].requirements[i].requirements, output: propulsion.specComponents[0].requirements[i].output });
                reactionsQuantities.push({ name: propulsion.specComponents[0].requirements[i].name, id: propulsion.specComponents[0].requirements[i].type_id, quantity: 0, requirements: propulsion.specComponents[0].requirements[i].requirements, output: propulsion.specComponents[0].requirements[i].output });
            }
        }
    }

    if (defRuns > 0) {
        for (let i = 0; i < defensive.specComponents[0].requirements.length; i++) {
            if (!defensive.specComponents[0].requirements[i].requirements) { //salvage
                totalSalvageRequiredForDefensive.push({ name: defensive.specComponents[0].requirements[i].name, id: defensive.specComponents[0].requirements[i].type_id, quantity: 0 });
                totalSalvageRequired.push({ name: defensive.specComponents[0].requirements[i].name, id: defensive.specComponents[0].requirements[i].type_id, quantity: 0 });
            } else {
                reactionsQuantitiesForDefensive.push({ name: defensive.specComponents[0].requirements[i].name, id: defensive.specComponents[0].requirements[i].type_id, quantity: 0, requirements: defensive.specComponents[0].requirements[i].requirements, output: defensive.specComponents[0].requirements[i].output });
                reactionsQuantities.push({ name: defensive.specComponents[0].requirements[i].name, id: defensive.specComponents[0].requirements[i].type_id, quantity: 0, requirements: defensive.specComponents[0].requirements[i].requirements, output: defensive.specComponents[0].requirements[i].output });
            }
        }
    }

    //remove duplicates
    // Aggregate unique salvage and reactions
    const uniqueSalvage = aggregateItems(totalSalvageRequired);
    const uniqueReactions = aggregateItems(reactionsQuantities);

    const uniqueSalvageForCore = aggregateItems(totalSalvageRequiredForCore);
    const uniqueReactionsForCore = aggregateItems(reactionsQuantitiesForCore);

    const uniqueSalvageForOffensive = aggregateItems(totalSalvageRequiredForOffensive);
    const uniqueReactionsForOffensive = aggregateItems(reactionsQuantitiesForOffensive);

    const uniqueSalvageForPropulsion = aggregateItems(totalSalvageRequiredForPropulsion);
    const uniqueReactionsForPropulsion = aggregateItems(reactionsQuantitiesForPropulsion);

    const uniqueSalvageForDefensive = aggregateItems(totalSalvageRequiredForDefensive);
    const uniqueReactionsForDefensive = aggregateItems(reactionsQuantitiesForDefensive);

    const coreMainComponentQuantities = blueprints.numRuns * coreRuns;
    const offMainComponentQuantities = blueprints.numRuns * offRuns;
    const propMainComponentQuantities = blueprints.numRuns * propRuns;
    const defMainComponentQuantities = blueprints.numRuns * defRuns;

    //calculate the broken down components into reaction and salvage quantities
    for (let i = 0; i < mainComponents.length; i++) {
        for (let j = 0; j < mainComponents[i].requirements.length; j++) {
            if (!mainComponents[i].requirements[j].requirements) { //salvage
                const salvageItem = mainComponents[i].requirements[j];
                const salvageItemId = salvageItem.type_id;
                const salvageItemQty = salvageItem.quantity;
                const totalQuantity = mainComponentsQuantities * salvageItemQty * materialEfficiencyBonus;
                uniqueSalvage.find(item => item.id === salvageItemId).quantity += Math.ceil(totalQuantity);
                if (coreRuns > 0) {
                    const totalQuantityForCore = coreMainComponentQuantities * salvageItemQty * materialEfficiencyBonus;
                    uniqueSalvageForCore.find(item => item.id === salvageItemId).quantity += Math.ceil(totalQuantityForCore);
                }
                if (offRuns > 0) {
                    const totalQuantityForOffensive = offMainComponentQuantities * salvageItemQty * materialEfficiencyBonus;
                    uniqueSalvageForOffensive.find(item => item.id === salvageItemId).quantity += Math.ceil(totalQuantityForOffensive);
                }
                if (propRuns > 0) {
                    const totalQuantityForPropulsion = propMainComponentQuantities * salvageItemQty * materialEfficiencyBonus;
                    uniqueSalvageForPropulsion.find(item => item.id === salvageItemId).quantity += Math.ceil(totalQuantityForPropulsion);
                }
                if (defRuns > 0) {
                    const totalQuantityForDefensive = defMainComponentQuantities * salvageItemQty * materialEfficiencyBonus;
                    uniqueSalvageForDefensive.find(item => item.id === salvageItemId).quantity += Math.ceil(totalQuantityForDefensive);
                }
            } else {
                const reactionItem = mainComponents[i].requirements[j];
                const reactionItemId = reactionItem.type_id;
                const reactionItemQty = reactionItem.quantity;
                const totalQuantity = mainComponentsQuantities * reactionItemQty * materialEfficiencyBonus;
                uniqueReactions.find(item => item.id === reactionItemId).quantity += Math.ceil(totalQuantity);
                if (coreRuns > 0) {
                    const totalQuantityForCore = coreMainComponentQuantities * reactionItemQty * materialEfficiencyBonus;
                    uniqueReactionsForCore.find(item => item.id === reactionItemId).quantity += Math.ceil(totalQuantityForCore);
                }
                if (offRuns > 0) {
                    const totalQuantityForOffensive = offMainComponentQuantities * reactionItemQty * materialEfficiencyBonus;
                    uniqueReactionsForOffensive.find(item => item.id === reactionItemId).quantity += Math.ceil(totalQuantityForOffensive);
                }
                if (propRuns > 0) {
                    const totalQuantityForPropulsion = propMainComponentQuantities * reactionItemQty * materialEfficiencyBonus;
                    uniqueReactionsForPropulsion.find(item => item.id === reactionItemId).quantity += Math.ceil(totalQuantityForPropulsion);
                }
                if (defRuns > 0) {
                    const totalQuantityForDefensive = defMainComponentQuantities * reactionItemQty * materialEfficiencyBonus;
                    uniqueReactionsForDefensive.find(item => item.id === reactionItemId).quantity += Math.ceil(totalQuantityForDefensive);
                }
            }
        }
    }

    if (coreRuns > 0) {
        const coreSpecComponentId = 29992;
        const coreSpecComponentQuantity = specComponentQuantities.find(item => item.id === coreSpecComponentId).quantity;
        for (let i = 0; i < core.specComponents[0].requirements.length; i++) {
            if (!core.specComponents[0].requirements[i].requirements) { //salvage
                const salvageItem = core.specComponents[0].requirements[i];
                const salvageItemId = salvageItem.type_id;
                const salvageItemQty = salvageItem.quantity;
                const totalQuantity = coreSpecComponentQuantity * salvageItemQty * materialEfficiencyBonus;
                uniqueSalvage.find(item => item.id === salvageItemId).quantity += Math.ceil(totalQuantity);
                uniqueSalvageForCore.find(item => item.id === salvageItemId).quantity += Math.ceil(totalQuantity);
            } else {
                const reactionItem = core.specComponents[0].requirements[i];
                const reactionItemId = reactionItem.type_id;
                const reactionItemQty = reactionItem.quantity;
                const totalQuantity = coreSpecComponentQuantity * reactionItemQty * materialEfficiencyBonus;
                uniqueReactions.find(item => item.id === reactionItemId).quantity += Math.ceil(totalQuantity);
                uniqueReactionsForCore.find(item => item.id === reactionItemId).quantity += Math.ceil(totalQuantity);
            }
        }
    }

    if (offRuns > 0) {
        const offSpecComponentId = 29994;
        const offSpecComponentQuantity = specComponentQuantities.find(item => item.id === offSpecComponentId).quantity;
        for (let i = 0; i < offensive.specComponents[0].requirements.length; i++) {
            if (!offensive.specComponents[0].requirements[i].requirements) { //salvage
                const salvageItem = offensive.specComponents[0].requirements[i];
                const salvageItemId = salvageItem.type_id;
                const salvageItemQty = salvageItem.quantity;
                const totalQuantity = offSpecComponentQuantity * salvageItemQty * materialEfficiencyBonus;
                uniqueSalvage.find(item => item.id === salvageItemId).quantity += Math.ceil(totalQuantity);
                uniqueSalvageForOffensive.find(item => item.id === salvageItemId).quantity += Math.ceil(totalQuantity);
            } else {
                const reactionItem = offensive.specComponents[0].requirements[i];
                const reactionItemId = reactionItem.type_id;
                const reactionItemQty = reactionItem.quantity;
                const totalQuantity = offSpecComponentQuantity * reactionItemQty * materialEfficiencyBonus;
                uniqueReactions.find(item => item.id === reactionItemId).quantity += Math.ceil(totalQuantity);
                uniqueReactionsForOffensive.find(item => item.id === reactionItemId).quantity += Math.ceil(totalQuantity);
            }
        }
    }

    if (propRuns > 0) {
        const propSpecComponentId = 30478;
        const propSpecComponentQuantity = specComponentQuantities.find(item => item.id === propSpecComponentId).quantity;
        for (let i = 0; i < propulsion.specComponents[0].requirements.length; i++) {
            if (!propulsion.specComponents[0].requirements[i].requirements) { //salvage
                const salvageItem = propulsion.specComponents[0].requirements[i];
                const salvageItemId = salvageItem.type_id;
                const salvageItemQty = salvageItem.quantity;
                const totalQuantity = propSpecComponentQuantity * salvageItemQty * materialEfficiencyBonus;
                uniqueSalvage.find(item => item.id === salvageItemId).quantity += Math.ceil(totalQuantity);
                uniqueSalvageForPropulsion.find(item => item.id === salvageItemId).quantity += Math.ceil(totalQuantity);
            } else {
                const reactionItem = propulsion.specComponents[0].requirements[i];
                const reactionItemId = reactionItem.type_id;
                const reactionItemQty = reactionItem.quantity;
                const totalQuantity = propSpecComponentQuantity * reactionItemQty * materialEfficiencyBonus;
                uniqueReactions.find(item => item.id === reactionItemId).quantity += Math.ceil(totalQuantity);
                uniqueReactionsForPropulsion.find(item => item.id === reactionItemId).quantity += Math.ceil(totalQuantity);
            }
        }
    }

    if (defRuns > 0) {
        const defSpecComponentId = 30008;
        const defSpecComponentQuantity = specComponentQuantities.find(item => item.id === defSpecComponentId).quantity;
        for (let i = 0; i < defensive.specComponents[0].requirements.length; i++) {
            if (!defensive.specComponents[0].requirements[i].requirements) { //salvage
                const salvageItem = defensive.specComponents[0].requirements[i];
                const salvageItemId = salvageItem.type_id;
                const salvageItemQty = salvageItem.quantity;
                const totalQuantity = defSpecComponentQuantity * salvageItemQty * materialEfficiencyBonus;
                uniqueSalvage.find(item => item.id === salvageItemId).quantity += Math.ceil(totalQuantity);
                uniqueSalvageForDefensive.find(item => item.id === salvageItemId).quantity += Math.ceil(totalQuantity);
            } else {
                const reactionItem = defensive.specComponents[0].requirements[i];
                const reactionItemId = reactionItem.type_id;
                const reactionItemQty = reactionItem.quantity;
                const totalQuantity = defSpecComponentQuantity * reactionItemQty * materialEfficiencyBonus;
                uniqueReactions.find(item => item.id === reactionItemId).quantity += Math.ceil(totalQuantity);
                uniqueReactionsForDefensive.find(item => item.id === reactionItemId).quantity += Math.ceil(totalQuantity);
            }
        }
    }

    //add salvage to requiredMaterials array
    for (let i = 0; i < uniqueSalvage.length; i++) {
        requiredMaterials.push({ id: uniqueSalvage[i].id, name: uniqueSalvage[i].name, quantity: uniqueSalvage[i].quantity });
    }

    if (coreRuns > 0) {
        for (let i = 0; i < uniqueSalvageForCore.length; i++) {
            coreRequiredMaterials.push({ id: uniqueSalvageForCore[i].id, name: uniqueSalvageForCore[i].name, quantity: uniqueSalvageForCore[i].quantity });
        }
    }

    if (offRuns > 0) {
        for (let i = 0; i < uniqueSalvageForOffensive.length; i++) {
            offensiveRequiredMaterials.push({ id: uniqueSalvageForOffensive[i].id, name: uniqueSalvageForOffensive[i].name, quantity: uniqueSalvageForOffensive[i].quantity });
        }
    }

    if (propRuns > 0) {
        for (let i = 0; i < uniqueSalvageForPropulsion.length; i++) {
            propulsionRequiredMaterials.push({ id: uniqueSalvageForPropulsion[i].id, name: uniqueSalvageForPropulsion[i].name, quantity: uniqueSalvageForPropulsion[i].quantity });
        }
    }

    if (defRuns > 0) {
        for (let i = 0; i < uniqueSalvageForDefensive.length; i++) {
            defensiveRequiredMaterials.push({ id: uniqueSalvageForDefensive[i].id, name: uniqueSalvageForDefensive[i].name, quantity: uniqueSalvageForDefensive[i].quantity });
        }
    }

    // gas things
    for (let i = 0; i < uniqueReactions.length; i++) {
        uniqueReactions[i].runs = Math.ceil(uniqueReactions[i].quantity / uniqueReactions[i].output);
    }

    if (coreRuns > 0) {
        for (let i = 0; i < uniqueReactionsForCore.length; i++) {
            uniqueReactionsForCore[i].runs = Math.ceil(uniqueReactionsForCore[i].quantity / uniqueReactionsForCore[i].output);
        }
    }

    if (offRuns > 0) {
        for (let i = 0; i < uniqueReactionsForOffensive.length; i++) {
            uniqueReactionsForOffensive[i].runs = Math.ceil(uniqueReactionsForOffensive[i].quantity / uniqueReactionsForOffensive[i].output);
        }
    }

    if (propRuns > 0) {
        for (let i = 0; i < uniqueReactionsForPropulsion.length; i++) {
            uniqueReactionsForPropulsion[i].runs = Math.ceil(uniqueReactionsForPropulsion[i].quantity / uniqueReactionsForPropulsion[i].output);
        }
    }

    if (defRuns > 0) {
        for (let i = 0; i < uniqueReactionsForDefensive.length; i++) {
            uniqueReactionsForDefensive[i].runs = Math.ceil(uniqueReactionsForDefensive[i].quantity / uniqueReactionsForDefensive[i].output);
        }
    }

    const reactorEfficiency = calculateReactorMEEfficiency(reactionStructure, reactionRigOne, reactionRigTwo, reactionLocation, settings);

    const gasRequirements = [];

    const coreGasRequirements = [];
    const offensiveGasRequirements = [];
    const propulsionGasRequirements = [];
    const defensiveGasRequirements = [];

    for (let i = 0; i < uniqueReactions.length; i++) {
        const runs = Math.ceil(uniqueReactions[i].quantity / uniqueReactions[i].output);
        uniqueReactions[i].runs = runs;
        for (let j = 0; j < uniqueReactions[i].requirements.length; j++) {
            const existingItem = gasRequirements.find(item => item.type_id === uniqueReactions[i].requirements[j].type_id);
            if (existingItem) {
                newQty = Math.ceil((uniqueReactions[i].requirements[j].quantity * runs) * reactorEfficiency);
                existingItem.quantity += newQty;
            } else {
                newQty = Math.ceil((uniqueReactions[i].requirements[j].quantity * runs) * reactorEfficiency);
                gasRequirements.push({
                    type_id: uniqueReactions[i].requirements[j].type_id,
                    name: uniqueReactions[i].requirements[j].name,
                    quantity: newQty
                });
            }
        }
    }

    // get reaction requirements for each type of subsystem
    // and add them to the type requirements array
    if (coreRuns > 0) {
        for (let i = 0; i < uniqueReactionsForCore.length; i++) {
            const runs = Math.ceil(uniqueReactionsForCore[i].quantity / uniqueReactionsForCore[i].output);
            uniqueReactionsForCore[i].runs = runs;
            for (let j = 0; j < uniqueReactionsForCore[i].requirements.length; j++) {
                const existingItem = coreGasRequirements.find(item => item.type_id === uniqueReactionsForCore[i].requirements[j].type_id);
                if (existingItem) {
                    newQty = Math.ceil((uniqueReactionsForCore[i].requirements[j].quantity * runs) * reactorEfficiency);
                    existingItem.quantity += newQty;
                } else {
                    newQty = Math.ceil((uniqueReactionsForCore[i].requirements[j].quantity * runs) * reactorEfficiency);
                    coreGasRequirements.push({
                        type_id: uniqueReactionsForCore[i].requirements[j].type_id,
                        name: uniqueReactionsForCore[i].requirements[j].name,
                        quantity: newQty
                    });
                }
            }
        }
    }

    if (coreRuns > 0) {
        for (let i = 0; i < coreGasRequirements.length; i++) {
            coreRequiredMaterials.push({ id: coreGasRequirements[i].type_id, name: coreGasRequirements[i].name, quantity: coreGasRequirements[i].quantity });
        }
    }

    if (offRuns > 0) {
        for (let i = 0; i < uniqueReactionsForOffensive.length; i++) {
            const runs = Math.ceil(uniqueReactionsForOffensive[i].quantity / uniqueReactionsForOffensive[i].output);
            uniqueReactionsForOffensive[i].runs = runs;
            for (let j = 0; j < uniqueReactionsForOffensive[i].requirements.length; j++) {
                const existingItem = offensiveGasRequirements.find(item => item.type_id === uniqueReactionsForOffensive[i].requirements[j].type_id);
                if (existingItem) {
                    newQty = Math.ceil((uniqueReactionsForOffensive[i].requirements[j].quantity * runs) * reactorEfficiency);
                    existingItem.quantity += newQty;
                } else {
                    newQty = Math.ceil((uniqueReactionsForOffensive[i].requirements[j].quantity * runs) * reactorEfficiency);
                    offensiveGasRequirements.push({
                        type_id: uniqueReactionsForOffensive[i].requirements[j].type_id,
                        name: uniqueReactionsForOffensive[i].requirements[j].name,
                        quantity: newQty
                    });
                }
            }
        }
    }

    if (offRuns > 0) {
        for (let i = 0; i < offensiveGasRequirements.length; i++) {
            offensiveRequiredMaterials.push({ id: offensiveGasRequirements[i].type_id, name: offensiveGasRequirements[i].name, quantity: offensiveGasRequirements[i].quantity });
        }
    }

    if (propRuns > 0) {
        for (let i = 0; i < uniqueReactionsForPropulsion.length; i++) {
            const runs = Math.ceil(uniqueReactionsForPropulsion[i].quantity / uniqueReactionsForPropulsion[i].output);
            uniqueReactionsForPropulsion[i].runs = runs;
            for (let j = 0; j < uniqueReactionsForPropulsion[i].requirements.length; j++) {
                const existingItem = propulsionGasRequirements.find(item => item.type_id === uniqueReactionsForPropulsion[i].requirements[j].type_id);
                if (existingItem) {
                    newQty = Math.ceil((uniqueReactionsForPropulsion[i].requirements[j].quantity * runs) * reactorEfficiency);
                    existingItem.quantity += newQty;
                } else {
                    newQty = Math.ceil((uniqueReactionsForPropulsion[i].requirements[j].quantity * runs) * reactorEfficiency);
                    propulsionGasRequirements.push({
                        type_id: uniqueReactionsForPropulsion[i].requirements[j].type_id,
                        name: uniqueReactionsForPropulsion[i].requirements[j].name,
                        quantity: newQty
                    });
                }
            }
        }
    }

    if (propRuns > 0) {
        for (let i = 0; i < propulsionGasRequirements.length; i++) {
            propulsionRequiredMaterials.push({ id: propulsionGasRequirements[i].type_id, name: propulsionGasRequirements[i].name, quantity: propulsionGasRequirements[i].quantity });
        }
    }

    if (defRuns > 0) {
        for (let i = 0; i < uniqueReactionsForDefensive.length; i++) {
            const runs = Math.ceil(uniqueReactionsForDefensive[i].quantity / uniqueReactionsForDefensive[i].output);
            uniqueReactionsForDefensive[i].runs = runs;
            for (let j = 0; j < uniqueReactionsForDefensive[i].requirements.length; j++) {
                const existingItem = defensiveGasRequirements.find(item => item.type_id === uniqueReactionsForDefensive[i].requirements[j].type_id);
                if (existingItem) {
                    newQty = Math.ceil((uniqueReactionsForDefensive[i].requirements[j].quantity * runs) * reactorEfficiency);
                    existingItem.quantity += newQty;
                } else {
                    newQty = Math.ceil((uniqueReactionsForDefensive[i].requirements[j].quantity * runs) * reactorEfficiency);
                    defensiveGasRequirements.push({
                        type_id: uniqueReactionsForDefensive[i].requirements[j].type_id,
                        name: uniqueReactionsForDefensive[i].requirements[j].name,
                        quantity: newQty
                    });
                }
            }
        }
    }

    if (defRuns > 0) {
        for (let i = 0; i < defensiveGasRequirements.length; i++) {
            defensiveRequiredMaterials.push({ id: defensiveGasRequirements[i].type_id, name: defensiveGasRequirements[i].name, quantity: defensiveGasRequirements[i].quantity });
        }
    }

    const slots = reactionSlots;

    let schedule = scheduleReactions(uniqueReactions, slots);

    //add more data about the reactions to the schedule
    for (let i = 0; i < schedule.length; i++) {
        if (schedule[i].runs > 0) {
            const reactionId = uniqueReactions.find(item => item.name === schedule[i].name).id;
            const reactionRequirements = uniqueReactions.find(item => item.id === reactionId).requirements;
            const output = uniqueReactions.find(item => item.id === reactionId).output;
            schedule[i].id = reactionId;
            schedule[i].output = output;
            schedule[i].requirements = reactionRequirements;
        }
    }

    gasRequirements.sort((a, b) => a.type_id - b.type_id);

    // get actual gas amounts required after scheduling
    const gasRequirementsAfterScheduling = [];

    for (let i = 0; i < schedule.length; i++) {
        const runs = schedule[i].runs;
        for (let j = 0; j < schedule[i].requirements?.length; j++) {
            const existingItem = gasRequirementsAfterScheduling.find(item => item.type_id === schedule[i].requirements[j].type_id);
            if (existingItem) {
                newQty = Math.ceil((schedule[i].requirements[j].quantity * runs) * reactorEfficiency);
                existingItem.quantity += newQty;
            } else {
                newQty = Math.ceil((schedule[i].requirements[j].quantity * runs) * reactorEfficiency);
                gasRequirementsAfterScheduling.push({
                    type_id: schedule[i].requirements[j].type_id,
                    name: schedule[i].requirements[j].name,
                    quantity: newQty
                });
            }
        }
    }

    //add everything to the requiredMaterials array
    for (let i = 0; i < gasRequirementsAfterScheduling.length; i++) {
        requiredMaterials.push({ id: gasRequirementsAfterScheduling[i].type_id, name: gasRequirementsAfterScheduling[i].name, quantity: gasRequirementsAfterScheduling[i].quantity });
    }

    const output = {
        requiredMaterialsForAll: requiredMaterials,
        blueprints: blueprints,
        coreRequiredMaterials: coreRequiredMaterials,
        offensiveRequiredMaterials: offensiveRequiredMaterials,
        propulsionRequiredMaterials: propulsionRequiredMaterials,
        defensiveRequiredMaterials: defensiveRequiredMaterials,
        schedule: schedule
    }

    return output;
}

module.exports = {
    getMaterialRequirements
};