const {
    reactionRequirements,
    mainComponents,
    defensive,
    offensive,
    propulsion,
    core,
    itemIds,
    BPOMaterialEfficiency,
    azbel,
    raitaru,
    tatara,
    athanor,
    mediumReactionTimeRigI,
    mediumReactionTimeRigII,
    mediumReactionMaterialRigI,
    mediumReactionMaterialRigII,
    largeReactionRigI,
    largeReactionRigII,
    mediumManufacturingMaterialRigI,
    mediumManufacturingMaterialRigII,
    mediumManufacturingTimeRigI,
    mediumManufacturingTimeRigII,
    largeManufacturingRigI,
    largeManufacturingRigII,
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
    wreckedThrusterSections,
    accelerantDecryptor,
    attaintmentDecryptor,
    augmentationDecryptor,
    parityDecryptor,
    processDecryptor,
    symmetryDecryptor,
    optimizedAttainmentDecryptor,
    optimizedAugmentationDecryptor,
    getRequirements,
    getPricePerUnit,
    calculateSpecComponentRequirements,
    calculateMainComponentRequirements } = require('./staticVars.js');
const { scheduleReactions } = require('./scheduleReactions.js');
const { materialsNamesAndIds } = require('../namesAndIds.js');

const getMaterialRequirements = (settings) => {
    let structure = settings.complex;
    let rigOne = settings.complexMeRig || "None";
    let rigTwo = settings.complexTeRig || "None";
    let location = settings.complexSystem || "wormhole";

    let reactionStructure = settings.refinery;
    let reactionRigOne = settings.meRig || "None";
    let reactionRigTwo = settings.teRig || "None";
    let reactionLocation = settings.system || "wormhole";

    let BPOME = settings.componentMaterialEfficiency || 10;
    let BPOTE = settings.componentTimeEfficiency || 20;

    let relicType = settings.ancientRelic;
    let decryptor = settings.decryptor;

    let coreRuns = settings.coreVolume == "" ? 0 : settings.coreVolume;
    let offRuns = settings.offensiveVolume == "" ? 0 : settings.offensiveVolume;
    let propRuns = settings.propulsionVolume == "" ? 0 : settings.propulsionVolume;
    let defRuns = settings.defensiveVolume == "" ? 0 : settings.defensiveVolume;

    let reactionSlots = settings.numSlots || 1;
    let skillLevel = settings.skillLevel || 1;
    let implantBonus = settings.implant;

    let requiredMaterials = [];

    let coreRequiredMaterials = [];
    let defensiveRequiredMaterials = [];
    let offensiveRequiredMaterials = [];
    let propulsionRequiredMaterials = [];

    const invent = (relicType, decryptor, skillLevel, coreRuns, offRuns, propRuns, defRuns) => {
        let output = {};

        let baseProbability;
        if (relicType === "Intact") {
            baseProbability = .26;
        }
        else if (relicType === "Malfunctioning") {
            baseProbability = .21;
        }
        else if (relicType === "Wrecked") {
            baseProbability = .14;
        }

        let baseRuns;
        if (relicType === "Intact") {
            baseRuns = 20;
        }
        if (relicType === "Malfunctioning") {
            baseRuns = 10;
        }
        if (relicType === "Wrecked") {
            baseRuns = 3;
        }

        let optionalDecryptor;
        if (decryptor === "Accelerant Decryptor") {
            optionalDecryptor = accelerantDecryptor;
        }
        else if (decryptor === "Attainment Decryptor") {
            optionalDecryptor = attaintmentDecryptor;
        }
        else if (decryptor === "Augmentation Decryptor") {
            optionalDecryptor = augmentationDecryptor;
        }
        else if (decryptor === "Parity Decryptor") {
            optionalDecryptor = parityDecryptor;
        }
        else if (decryptor === "Process Decryptor") {
            optionalDecryptor = processDecryptor;
        }
        else if (decryptor === "Symmetry Decryptor") {
            optionalDecryptor = symmetryDecryptor;
        }
        else if (decryptor === "Optimized Attainment Decryptor") {
            optionalDecryptor = optimizedAttainmentDecryptor;
        }
        else if (decryptor === "Optimized Augmentation Decryptor") {
            optionalDecryptor = optimizedAugmentationDecryptor;
        }
        else if (decryptor === "None") {
            optionalDecryptor = {
                typeName: "None",
                typeId: null,
                probabilityModifier: 1,
                inventionMEModifier: 0,
                inventionTEModifier: 0,
                inventionMaxRunModifier: 0,
            };
        }

        output.decryptor = optionalDecryptor;

        const skillMultiplier = (skillLevel + skillLevel) / 30;
        const encryptionMultiplier = skillLevel / 40;

        let successChance = baseProbability * (1 + skillMultiplier + encryptionMultiplier) * (optionalDecryptor.probabilityModifier);

        successChance = (successChance * 100).toFixed(1);

        output.successChance = successChance / 100;

        output.numRuns = optionalDecryptor.inventionMaxRunModifier + baseRuns;

        output.materialEfficiency = 2 + optionalDecryptor.inventionMEModifier;

        output.timeEfficiency = 4 + optionalDecryptor.inventionTEModifier;

        output.coreRuns = Math.ceil(coreRuns / output.successChance);
        output.offRuns = Math.ceil(offRuns / output.successChance);
        output.propRuns = Math.ceil(propRuns / output.successChance);
        output.defRuns = Math.ceil(defRuns / output.successChance);

        return output;
    }

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

    const calculateSpecComponentQuantities = (coreRuns, offRuns, propRuns, defRuns, blueprints, structure, rigOne, rigTwo) => {
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

    const specComponentQuantities = calculateSpecComponentQuantities(coreRuns, offRuns, propRuns, defRuns, blueprints, structure, rigOne, rigTwo, location);

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

    const getMaterialEfficiencyBonus = (BPOME, BPOTE, structure, rigOne, rigTwo, location) => {
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

    const materialEfficiencyBonus = getMaterialEfficiencyBonus(BPOME, BPOTE, settings.complex, rigOne, rigTwo, location);

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
    const aggregateItems = (itemsArray) => {
        const itemMap = {};
        itemsArray.forEach(item => {
            if (!itemMap[item.name]) {
                itemMap[item.name] = { ...item };
            } else {
                itemMap[item.name].quantity += item.quantity;
            }
        });
        return Object.values(itemMap);
    };

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

    const calculateReactorMEEfficiency = (reactionStructure, reactionRigOne, reactionRigTwo, reactionLocation) => {
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
            if (settings.tataraRig == "T1") {
                rigME = largeReactionRigI;
            }
            if (settings.tataraRig == "T2") {
                rigME = largeReactionRigII;
            }
            if (settings.tataraRig == "None") {
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
        if (reactionLocation == "highsec") {
            locationBonus = rigME.highsecBonus;
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

    const reactorEfficiency = calculateReactorMEEfficiency(reactionStructure, reactionRigOne, reactionRigTwo, reactionLocation);

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