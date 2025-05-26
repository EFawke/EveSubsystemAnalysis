const {
    accelerantDecryptor,
    attaintmentDecryptor,
    augmentationDecryptor,
    parityDecryptor,
    processDecryptor,
    symmetryDecryptor,
    optimizedAttainmentDecryptor,
    optimizedAugmentationDecryptor} = require('./staticVars.js');

const invent = (relicType, decryptor, skillLevel, coreRuns, offRuns, propRuns, defRuns) => {
    console.log(skillLevel);
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

    // console.log(output);
    return output;
}

module.exports = { invent };