//functions
const axios = require('axios');

const getRequirements = (type_id) => {
    for (let i = 0; i < reactionRequirements.length; i++) {
        if (reactionRequirements[i].type_id === type_id) {
            return reactionRequirements[i].requirements;
        }
    }
}

async function getPricePerUnit(itemIds) {
    try {
        const prices = [];
        for (const itemId of itemIds) {
            const response = await axios.get(`https://evetycoon.com/api/v1/market/stats/10000002/${itemId}`);
            response.data.type_id = itemId;
            prices.push(response.data);
        }
        return prices;
    } catch (error) {
        console.error('Error fetching prices:', error);
        return [];
    }
}

const calculateSpecComponentRequirements = (componentType, numUnits, materialEfficiencyBonus, totalSalvageRequired, reactionsQuantities) => {
    const numberOfComponents = numUnits;
    const requirements = componentType.specComponents[0].requirements;
    const componentBaseQuantity = componentType.specComponents[0].quantity;
    for (let i = 0; i < requirements.length; i++) {
        const baseNumberRequiredForComponent = requirements[i].quantity;
        const baseNumber = componentBaseQuantity * baseNumberRequiredForComponent * numberOfComponents;
        const numberWithME = Math.ceil(baseNumber * materialEfficiencyBonus);

        if (!requirements[i].requirements) { // salvage
            const existingItem = totalSalvageRequired.find(item => item.type_id === requirements[i].type_id);
            if (existingItem) {
                existingItem.quantity += numberWithME;
            } else {
                requirements[i].quantity = numberWithME;
                totalSalvageRequired.push(requirements[i]);
            }
        } else { // reactions
            const existingItem = reactionsQuantities.find(item => item.type_id === requirements[i].type_id);
            if (existingItem) {
                existingItem.quantity += numberWithME;
            } else {
                requirements[i].quantity = numberWithME;
                reactionsQuantities.push(requirements[i]);
            }
        }
    }
}

const calculateMainComponentRequirements = (mainComponents, numUnits, materialEfficiencyBonus, totalSalvageRequired, reactionsQuantities) => {
    for (let i = 0; i < mainComponents.length; i++) {
        const componentRequirements = mainComponents[i].requirements;
        for (let j = 0; j < componentRequirements.length; j++) {
            // console.log(componentRequirements[j]);
            if (!componentRequirements[j].requirements) {// salvage
                const existingItem = totalSalvageRequired.find(item => item.type_id === componentRequirements[j].type_id);
                if (existingItem) {
                    existingItem.quantity += Math.ceil((componentRequirements[j].quantity * numUnits) * materialEfficiencyBonus);
                } else {
                    let newQty = Math.ceil((componentRequirements[j].quantity * numUnits) * materialEfficiencyBonus);
                    componentRequirements[j].quantity = newQty;
                    totalSalvageRequired.push(componentRequirements[j]);
                }
            } else { // reactions
                const existingItem = reactionsQuantities.find(item => item.type_id === componentRequirements[j].type_id);
                if (existingItem) {
                    existingItem.quantity += Math.ceil((componentRequirements[j].quantity * numUnits) * materialEfficiencyBonus);
                } else {
                    componentRequirements[j].quantity = Math.ceil((componentRequirements[j].quantity * numUnits) * materialEfficiencyBonus);
                    reactionsQuantities.push(componentRequirements[j]);
                }
            }
        }
    }
}

// Material Efficiency Variables
const BPOMaterialEfficiency = .1;

//structure stats
const azbel = {
    materialReduction: .01,
    iskReduction: .04,
    timeReduction: .2,
};
const raitaru = {
    materialReduction: .01,
    iskReduction: .03,
    timeReduction: .15,
};
const tatara = {
    timeReduction: .25,
};
const athanor = {
    timeRecuction: 0
};

//reaction rigs
const mediumReactionTimeRigI = {
    timeReduction: .2,
    wormholeBonus: 1.1,
    nullsecBonus: 1.1,
    lowsecBonus: 1,
};
const mediumReactionTimeRigII = {
    timeReduction: .24,
    wormholeBonus: 1.1,
    nullsecBonus: 1.1,
    lowsecBonus: 1,
};
const mediumReactionMaterialRigI = {
    materialReduction: .02,
    wormholeBonus: 1.1,
    nullsecBonus: 1.1,
    lowsecBonus: 1,
};
const mediumReactionMaterialRigII = {
    materialReduction: .024,
    wormholeBonus: 1.1,
    nullsecBonus: 1.1,
    lowsecBonus: 1,
};
const largeReactionRigI = {
    materialReduction: .02,
    timeReduction: .2,
    wormholeBonus: 1.1,
    nullsecBonus: 1.1,
    lowsecBonus: 1,
}
const largeReactionRigII = {
    materialReduction: .024,
    timeReduction: .24,
    wormholeBonus: 1.1,
    nullsecBonus: 1.1,
    lowsecBonus: 1,
}
//manufacturing rigs
const mediumManufacturingMaterialRigI = {
    materialReduction: .02,
    highsecBonus: 1,
    lowsecBonus: 1.9,
    nullsecBonus: 2.1,
    wormholeBonus: 2.1,
};
const mediumManufacturingMaterialRigII = {
    materialReduction: .024,
    highsecBonus: 1,
    lowsecBonus: 1.9,
    nullsecBonus: 2.1,
    wormholeBonus: 2.1,
};
const mediumManufacturingTimeRigI = {
    timeReduction: .2,
    highsecBonus: 1,
    lowsecBonus: 1.9,
    nullsecBonus: 2.1,
    wormholeBonus: 2.1,
};
const mediumManufacturingTimeRigII = {
    timeReduction: .24,
    highsecBonus: 1,
    lowsecBonus: 1.9,
    nullsecBonus: 2.1,
    wormholeBonus: 2.1,
};
const largeManufacturingRigI = {
    materialReduction: .02,
    timeReduction: .2,
    highsecBonus: 1,
    lowsecBonus: 1.9,
    nullsecBonus: 2.1,
    wormholeBonus: 2.1,
};
const largeManufacturingRigII = {
    materialReduction: .024,
    timeReduction: .24,
    highsecBonus: 1,
    lowsecBonus: 1.9,
    nullsecBonus: 2.1,
    wormholeBonus: 2.1,
}

// Blueprint Requirements
const reactionRequirements = [
    {
        name: "PPD Fullerene Fibers",
        type_id: 30304,
        output: 250,
        requirements: [
            {
                name: "Hydrogen Fuel Block",
                quantity: 5,
                type_id: 4246,
            },
            {
                name: "Fullerite-C60",
                quantity: 100,
                type_id: 30371,
            },
            {
                name: "Fullerite-C50",
                quantity: 300,
                type_id: 30370,
            },
            {
                name: "Pyerite",
                quantity: 800,
                type_id: 35,
            }
        ]
    },
    {
        name: "Fullerene Intercalated Graphite",
        type_id: 30305,
        output: 120,
        requirements: [
            {
                name: "Hydrogen Fuel Block",
                quantity: 5,
                type_id: 4246,
            },
            {
                name: "Fullerite-C60",
                quantity: 100,
                type_id: 30371,
            },
            {
                name: "Fullerite-C70",
                quantity: 100,
                type_id: 30372,
            },
            {
                name: "Mexallon",
                quantity: 600,
                type_id: 36,
            }
        ]
    },
    {
        name: "Fulleroferrocene",
        type_id: 30303,
        output: 1000,
        requirements: [
            {
                name: "Oxygen Fuel Block",
                quantity: 5,
                type_id: 4312,
            },
            {
                name: "Fullerite-C60",
                quantity: 100,
                type_id: 30371,
            },
            {
                name: "Fullerite-C50",
                quantity: 200,
                type_id: 30370,
            },
            {
                name: "Tritanium",
                quantity: 1000,
                type_id: 34,
            }
        ],
    },
    {
        name: "Carbon-86 Epoxy Resin",
        type_id: 30310,
        output: 160,
        requirements: [
            {
                name: "Nitrogen Fuel Block",
                quantity: 5,
                type_id: 4051,
            },
            {
                name: "Fullerite-C32",
                quantity: 100,
                type_id: 30376,
            },
            {
                name: "Fullerite-C320",
                quantity: 100,
                type_id: 30377,
            },
            {
                name: "Zydrine",
                quantity: 30,
                type_id: 39,
            }
        ]
    },
    {
        name: "Methanofullerene",
        type_id: 30306,
        output: 160,
        requirements: [
            {
                name: "Hydrogen Fuel Block",
                quantity: 5,
                type_id: 4246,
            },
            {
                name: "Fullerite-C70",
                quantity: 100,
                type_id: 30372,
            },
            {
                name: "Fullerite-C72",
                quantity: 100,
                type_id: 30373,
            },
            {
                name: "Isogen",
                quantity: 300,
                type_id: 37,
            }
        ]
    },
    {
        name: "Scandium Metallofullerene",
        type_id: 30308,
        output: 160,
        requirements: [
            {
                name: "Helium Fuel Block",
                quantity: 5,
                type_id: 4247,
            },
            {
                name: "Zydrine",
                quantity: 25,
                type_id: 39,
            },
            {
                name: "Fullerite-C72",
                type_id: 30373,
                quantity: 100,
            },
            {
                name: "Fullerite-C28",
                quantity: 100,
                type_id: 30375,
            }
        ]
    },
    {
        name: "Graphene Nanoribbons",
        type_id: 30309,
        output: 120,
        requirements: [
            {
                name: "Nitrogen Fuel Block",
                quantity: 5,
                type_id: 4051,
            },
            {
                name: "Fullerite-C28",
                quantity: 100,
                type_id: 30375,
            },
            {
                name: "Fullerite-C32",
                quantity: 100,
                type_id: 30376,
            },
            {
                name: "Nocxium",
                quantity: 400,
                type_id: 38,
            }
        ]
    },
    {
        name: "Lanthanum Metallofullerene",
        type_id: 30307,
        output: 120,
        requirements: [
            {
                name: "Oxygen Fuel Block",
                quantity: 5,
                type_id: 4312,
            },
            {
                name: "Fullerite-C70",
                quantity: 100,
                type_id: 30372,
            },
            {
                name: "Fullerite-C84",
                quantity: 100,
                type_id: 30374,
            },
            {
                name: "Nocxium",
                quantity: 200,
                type_id: 38,
            }
        ]
    }
];
const mainComponents = [
    {
        name: "Fullerene Intercalated Sheets",
        quantity: 1,
        type_id: 30002,
        requirements: [
            {
                name: "Neurovisual Input Matrix",
                quantity: 55,
                type_id: 30251,
            },
            {
                name: "Melted Nanoribbons",
                quantity: 2,
                type_id: 30259,
            },
            {
                name: "Modified Fluid Router",
                quantity: 6,
                type_id: 30021,
            },
            {
                name: "Powdered C-540 Graphite",
                quantity: 4,
                type_id: 30019,
            },
            //reactions
            {
                name: "PPD Fullerene Fibers",
                quantity: 6,
                type_id: 30304,
                requirements: getRequirements(30304),
                output: 250
            },
            {
                name: "Fullerene Intercalated Graphite",
                quantity: 2,
                type_id: 30305,
                requirements: getRequirements(30305),
                output: 120
            },
            {
                name: "Fulleroferrocene",
                quantity: 33,
                type_id: 30303,
                requirements: getRequirements(30303),
                output: 1000
            }
        ]
    },
    {
        name: "Fulleroferrocene Power Conduits",
        quantity: 1,
        type_id: 30476,
        requirements: [
            {
                name: "Powdered C-540 Graphite",
                type_id: 30019,
                quantity: 3,
            },
            {
                name: "Modified Fluid Router",
                quantity: 4,
                type_id: 30021,
            },
            {
                name: "Neurovisual Input Matrix",
                quantity: 4,
                type_id: 30251,
            },
            {
                name: "Electromechanical Hull Sheeting",
                quantity: 6,
                type_id: 30254,
            },
            //reactions
            {
                name: "Fulleroferrocene",
                quantity: 28,
                type_id: 30303,
                requirements: getRequirements(30303),
                output: 1000
            },
            {
                name: "PPD Fullerene Fibers",
                quantity: 11,
                type_id: 30304,
                requirements: getRequirements(30304),
                output: 250
            },
            {
                name: "Methanofullerene",
                quantity: 60,
                type_id: 30306,
                requirements: getRequirements(30306),
                output: 160,
            },
            {
                name: "Scandium Metallofullerene",
                quantity: 44,
                type_id: 30308,
                requirements: getRequirements(30308),
                output: 160,
            }
        ]
    },
    {
        name: "Metallofullerene Plating",
        quantity: 1,
        type_id: 30464,
        requirements: [
            {
                name: "Modified Fluid Router",
                type_id: 30021,
                quantity: 4,
            },
            {
                name: "Electromechanical Hull Sheeting",
                type_id: 30254,
                quantity: 6,
            },
            //reactions
            {
                name: "Fulleroferrocene",
                type_id: 30303,
                quantity: 17,
                requirements: getRequirements(30303),
                output: 1000,
            },
            {
                name: "PPD Fullerene Fibers",
                type_id: 30304,
                quantity: 4,
                requirements: getRequirements(30304),
                output: 250,
            }
        ],
    },
    {
        name: "Nanowire Composites",
        quantity: 1,
        type_id: 30474,
        requirements: [
            {
                name: "Modified Fluid Router",
                quantity: 3,
                type_id: 30021,
            },
            {
                name: "Electromechanical Hull Sheeting",
                quantity: 3,
                type_id: 30254,
            },
            //reactions
            {
                name: "PPD Fullerene Fibers",
                quantity: 2,
                type_id: 30304,
                requirements: getRequirements(30304),
                output: 250,
            },
            {
                name: "Fulleroferrocene",
                quantity: 11,
                type_id: 30303,
                output: 1000,
                requirements: getRequirements(30303),
            }

        ]
    },
    {
        name: "Neurovisual Output Analyzer",
        quantity: 1,
        type_id: 30470,
        requirements: [
            {
                name: "Powdered C-540 Graphite",
                quantity: 4,
                type_id: 30019,
            },
            {
                name: "Modified Fluid Router",
                quantity: 4,
                type_id: 30021,
            },
            {
                name: "Electromechanical Hull Sheeting",
                quantity: 11,
                type_id: 30254,
            },
            {
                name: "Melted Nanoribbons",
                quantity: 4,
                type_id: 30259,
            },
            //reactions
            {
                name: "Scandium Metallofullerene",
                quantity: 44,
                type_id: 30308,
                output: 160,
                requirements: getRequirements(30308)
            },
            {
                name: "Carbon-86 Epoxy Resin",
                quantity: 222,
                type_id: 30310,
                output: 160,
                requirements: getRequirements(30310)
            },
            {
                name: "Fulleroferrocene",
                quantity: 56,
                type_id: 30303,
                output: 1000,
                requirements: getRequirements(30303)
            }
        ]
    }
]
const defensive = {
    mainComponents: mainComponents,
    specComponents: [
        {
            name: "Reinforced Metallofullerene Alloys",
            quantity: 7,
            type_id: 30008,
            requirements: [
                {
                    name: "Powdered C-540 Graphite",
                    quantity: 2,
                    type_id: 30019,
                },
                {
                    name: "Modified Fluid Router",
                    quantity: 3,
                    type_id: 30021,
                },
                {
                    name: "Heuristic Selfassemblers",
                    quantity: 4,
                    type_id: 30022,
                },
                {
                    name: "Electromechanical Hull Sheeting",
                    quantity: 10,
                    type_id: 30254,
                },
                //reactions
                {
                    name: "Fullerene Intercalated Graphite",
                    quantity: 11,
                    type_id: 30305,
                    output: 120,
                    requirements: getRequirements(30305)
                },
                {
                    name: "Scandium Metallofullerene",
                    quantity: 22,
                    type_id: 30308,
                    output: 160,
                    requirements: getRequirements(30308)
                },
                {
                    name: "Graphene Nanoribbons",
                    quantity: 7,
                    type_id: 30309,
                    output: 120,
                    requirements: getRequirements(30309)
                }
            ]
        },
    ]
}
const offensive = {
    mainComponents: mainComponents,
    specComponents: [
        {
            name: "Warfare Computation Core",
            quantity: 7,
            type_id: 29994,
            requirements: [
                {
                    name: "Powdered C-540 Graphite",
                    quantity: 2,
                    type_id: 30019,
                },
                {
                    name: "Modified Fluid Router",
                    quantity: 3,
                    type_id: 30021,
                },
                {
                    name: "Emergent Combat Analyzer",
                    quantity: 4,
                    type_id: 30248,
                },
                {
                    name: "Electromechanical Hull Sheeting",
                    quantity: 10,
                    type_id: 30254,
                },
                //reactions
                {
                    name: "Fullerene Intercalated Graphite",
                    quantity: 11,
                    type_id: 30305,
                    output: 120,
                    requirements: getRequirements(30305)
                },
                {
                    name: "Scandium Metallofullerene",
                    quantity: 22,
                    type_id: 30308,
                    output: 160,
                    requirements: getRequirements(30308)
                },
                {
                    name: "Graphene Nanoribbons",
                    quantity: 7,
                    type_id: 30309,
                    output: 120,
                    requirements: getRequirements(30309)
                }
            ]
        }
    ]
}
const propulsion = {
    mainComponents: mainComponents,
    specComponents: [
        {
            name: "Reconfigured Subspace Calibrator",
            type_id: 30478,
            quantity: 7,
            requirements: [
                {
                    name: "Modified Fluid Router",
                    quantity: 3,
                    type_id: 30021,
                },
                {
                    name: "Electromechanical Hull Sheeting",
                    quantity: 10,
                    type_id: 30254,
                },
                {
                    name: "Resonance Calibration Matrix",
                    quantity: 4,
                    type_id: 30258,
                },
                {
                    name: "Powdered C-540 Graphite",
                    quantity: 2,
                    type_id: 30019,
                },
                //reactions
                {
                    name: "Lanthanum Metallofullerene",
                    quantity: 7,
                    output: 120,
                    type_id: 30307,
                    requirements: getRequirements(30307)
                },
                {
                    name: "Graphene Nanoribbons",
                    type_id: 30309,
                    quantity: 7,
                    output: 120,
                    requirements: getRequirements(30309)
                },
                {
                    name: "Fulleroferrocene",
                    type_id: 30303,
                    quantity: 11,
                    output: 1000,
                    requirements: getRequirements(30303)
                }
            ]
        }
    ]
}
const core = {
    mainComponents: mainComponents,
    specComponents: [
        {
            name: "Optimized Nano-Engines",
            type_id: 29992,
            quantity: 7,
            requirements: [
                {
                    name: "Fused Nanomechanical Engines",
                    quantity: 4,
                    type_id: 30018,
                },
                {
                    name: "Modified Fluid Router",
                    quantity: 3,
                    type_id: 30021,
                },
                {
                    name: "Electromechanical Hull Sheeting",
                    quantity: 10,
                    type_id: 30254,
                },
                {
                    name: "Powdered C-540 Graphite",
                    quantity: 2,
                    type_id: 30019,
                },
                //reactions
                {
                    name: "PPD Fullerene Fibers",
                    quantity: 11,
                    type_id: 30304,
                    output: 250,
                    requirements: getRequirements(30304)
                },
                {
                    name: "Lanthanum Metallofullerene",
                    quantity: 7,
                    type_id: 30307,
                    output: 120,
                    requirements: getRequirements(30307)
                },
                {
                    name: "Graphene Nanoribbons",
                    quantity: 7,
                    type_id: 30309,
                    output: 120,
                    requirements: getRequirements(30309)
                }
            ]
        }
    ]
}

const intactArmorNanobots = {
    typeId: 30614,
    typeName: "Intact Armor Nanobots",
    baseProbability: .26,
    baseRuns: 20,
    datacoreOne: 11496,
    datacoreTwo: 20171,
    //skills and levels
    sleeperEncryptionMethods: 4,
    skillOne: 4,
    skillTwo: 4,
};

const intactPowerCores = {
    typeId: 30582,
    typeName: "Intact Power Cores",
    baseProbability: .26,
    baseRuns: 20,
    datacoreOne: 20115,
    datacoreTwo: 20414,
    //skills and levels
    sleeperEncryptionMethods: 4,
    skillOne: 4,
    skillTwo: 4,
};

const intactWeaponSubroutines = {
    typeId: 30628,
    typeName: "Intact Weapon Subroutines",
    baseProbability: .26,
    baseRuns: 20,
    datacoreOne: 20412,
    datacoreTwo: 20425,

    //skills and levels
    sleeperEncryptionMethods: 4,
    skillOne: 4,
    skillTwo: 4,
};

const intactThrusterSections = {
    typeId: 30187,
    typeName: "Intact Thruster Sections",
    baseProbability: .26,
    baseRuns: 20,
    datacoreOne: 20114,
    datacoreTwo: 20420,
    //skills and levels
    sleeperEncryptionMethods: 5,
    skillOne: 5,
    skillTwo: 5,
};

const malfunctioningArmorNanobots = {
    typeId: 30615,
    typeName: "Malfunctioning Armor Nanobots",
    baseProbability: .21,
    baseRuns: 10,
    datacoreOne: 11496,
    datacoreTwo: 20171,
    //skills and levels
    sleeperEncryptionMethods: 4,
    skillOne: 4,
    skillTwo: 4,
};

const malfunctioningPowerCores = {
    typeId: 30586,
    typeName: "Malfunctioning Power Cores",
    baseProbability: .21,
    baseRuns: 10,
    datacoreOne: 20115,
    datacoreTwo: 20414,
    //skills and levels
    sleeperEncryptionMethods: 4,
    skillOne: 4,
    skillTwo: 4,
};

const malfunctioningWeaponSubroutines = {
    typeId: 30632,
    typeName: "Malfunctioning Weapon Subroutines",
    baseProbability: .21,
    baseRuns: 10,
    datacoreOne: 20412,
    datacoreTwo: 20425,
    //skills and levels
    sleeperEncryptionMethods: 4,
    skillOne: 4,
    skillTwo: 4,
};

const malfunctioningThrusterSections = {
    typeId: 30586,
    typeName: "Malfunctioning Power Cores",
    baseProbability: .21,
    baseRuns: 10,
    datacoreOne: 20115,
    datacoreTwo: 20414,
    //skills and levels
    sleeperEncryptionMethods: 4,
    skillOne: 4,
    skillTwo: 4,
};

const wreckedArmorNanobots = {
    typeId: 30618,
    typeName: "Wrecked Armor Nanobots",
    baseProbability: .14,
    baseRuns: 3,
    datacoreOne: 11496,
    datacoreTwo: 20171,
    //skills and levels
    sleeperEncryptionMethods: 4,
    skillOne: 4,
    skillTwo: 4,
};

const wreckedPowerCores = {
    typeId: 30588,
    typeName: "Wrecked Power Cores",
    baseProbability: .14,
    baseRuns: 3,
    datacoreOne: 20115,
    datacoreTwo: 20414,
    //skills and levels
    sleeperEncryptionMethods: 4,
    skillOne: 4,
    skillTwo: 4,
};

const wreckedWeaponSubroutines = {
    typeId: 30633,
    typeName: "Wrecked Weapon Subroutines",
    baseProbability: .14,
    baseRuns: 3,
    datacoreOne: 20412,
    datacoreTwo: 20425,
    //skills and levels
    sleeperEncryptionMethods: 4,
    skillOne: 4,
    skillTwo: 4,
};

const wreckedThrusterSections = {
    typeId: 30588,
    typeName: "Wrecked Power Cores",
    baseProbability: .14,
    baseRuns: 3,
    datacoreOne: 20115,
    datacoreTwo: 20414,
    //skills and levels
    sleeperEncryptionMethods: 4,
    skillOne: 4,
    skillTwo: 4,
};

const accelerantDecryptor = {
    typeName: "Accelerant Decryptor",
    typeId: 34201,
    probabilityModifier: 1.2,
    inventionMEModifier: 2,
    inventionTEModifier: 10,
    inventionMaxRunModifier: 1
}

const attaintmentDecryptor = {
    typeName: "Attainment Decryptor",
    typeId: 34202,
    probabilityModifier: 1.8,
    inventionMEModifier: -1,
    inventionTEModifier: 4,
    inventionMaxRunModifier: 4
}

const augmentationDecryptor = {
    typeName: "Augmentation Decryptor",
    typeId: 34202,
    probabilityModifier: 0.6,
    inventionMEModifier: -2,
    inventionTEModifier: 2,
    inventionMaxRunModifier: 9
}

const parityDecryptor = {
    typeName: "Parity Decryptor",
    typeId: 34204,
    probabilityModifier: 1.5,
    inventionMEModifier: 1,
    inventionTEModifier: -2,
    inventionMaxRunModifier: 3
}

const processDecryptor = {
    typeName: "Process Decryptor",
    typeId: 34205,
    probabilityModifier: 1.1,
    inventionMEModifier: 3,
    inventionTEModifier: 6,
    inventionMaxRunModifier: 0
}

const symmetryDecryptor = {
    typeName: "Symmetry Decryptor",
    typeId: 34206,
    probabilityModifier: 1,
    inventionMEModifier: 1,
    inventionTEModifier: 8,
    inventionMaxRunModifier: 2
}

const optimizedAttainmentDecryptor = {
    typeName: "Optimized Attainment Decryptor",
    typeId: 34207,
    probabilityModifier: 1.9,
    inventionMEModifier: 1,
    inventionTEModifier: -2,
    inventionMaxRunModifier: 2
}

const optimizedAugmentationDecryptor = {
    typeName: "Attainment Decryptor",
    typeId: 34208,
    probabilityModifier: 0.9,
    inventionMEModifier: 2,
    inventionTEModifier: 0,
    inventionMaxRunModifier: 7
}

// Item IDs
const itemIds = [
    //salvage
    45662,
    30024,
    30270,
    30269,
    30254,
    30248,
    30271,
    45661,
    30018,
    30022,
    30268,
    30259,
    30021,
    30251,
    30019,
    30258,
    45660,
    45663,
    30252,
    //minerals
    37,
    40,
    36,
    38,
    35,
    34,
    39,
    //blocks
    4247,
    4246,
    4051,
    4312,
    //gas
    30375,
    30376,
    30377,
    30370,
    30378,
    30371,
    30372,
    30373,
    30374,
    //Optimized Attainment Decryptor
    34207,
    //intact relics
    30582,
    30614,
    30628,
    30187,
];

module.exports = { 
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
    calculateMainComponentRequirements,
};