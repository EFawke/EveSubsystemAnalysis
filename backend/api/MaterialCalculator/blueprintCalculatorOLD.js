const intactArmorNanobots = {
    typeId: 30614,
    baseProbability: .26,
    optionalDecryptor: .9, // Optimized Attainment Decryptor
    datacoreOne: 11496,
    datacoreTwo: 20171,
    decryptor: 34207,
    //skills and levels
    sleeperEncryptionMethods: 4,
    skillOne: 4,
    skillTwo: 4,
};

const intactPowerCores = {
    typeId: 30582,
    baseProbability: .26,
    optionalDecryptor: .9, // Optimized Attainment Decryptor
    decryptor: 34207,
    datacoreOne: 20115,
    datacoreTwo: 20414,
    //skills and levels
    sleeperEncryptionMethods: 4,
    skillOne: 4,
    skillTwo: 4,
};

const intactWeaponSubroutines = {
    typeId: 30628,
    baseProbability: .26,
    optionalDecryptor: .9, // Optimized Attainment Decryptor
    decryptor: 34207,
    datacoreOne: 20412,
    datacoreTwo: 20425,

    //skills and levels
    sleeperEncryptionMethods: 4,
    skillOne: 4,
    skillTwo: 4,
};

const intactThrusterSections = {
    typeId: 30187,
    baseProbability: .26,
    optionalDecryptor: .9, // Optimized Attainment Decryptor
    decryptor: 34207,
    datacoreOne: 20114,
    datacoreTwo: 20420,
    //skills and levels
    sleeperEncryptionMethods: 5,
    skillOne: 5,
    skillTwo: 5,
};

function getSuccessChance(item) {
    const { baseProbability, optionalDecryptor, sleeperEncryptionMethods, skillOne, skillTwo } = item;
  
    const skillMultiplier = (skillOne + skillTwo) / 30;
    const encryptionMultiplier = sleeperEncryptionMethods / 40;
    
    let successChance = baseProbability * (1 + skillMultiplier + encryptionMultiplier) * (1 + optionalDecryptor);
    
    successChance = (successChance * 100).toFixed(1);

    return successChance / 100;
}

module.exports = { intactArmorNanobots, intactPowerCores, intactWeaponSubroutines, intactThrusterSections, getSuccessChance };