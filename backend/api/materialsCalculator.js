const axios = require('axios');
const express = require('express');
const getRequirements = (type_id) => {
    for (let i = 0; i < reactionRequirements.length; i++) {
        if (reactionRequirements[i].type_id === type_id) {
            return reactionRequirements[i].requirements;
        }
    }
}
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

let numUnits = 352;
const meForEq = 0.1; // 10% Material Efficiency for BPO
const stMEForEq = 0.01; // 1% Material Efficiency for Azbel
const BPCMaterialEfficiency = 3; // 3% Material Efficiency for BPC
const tataraRig = 2; // 2% Material Efficiency for Tatara Rig (T1)
const azbelRig = 0.02; // 2% Material Efficiency for Azbel Rig (T2)
const wormholeBonus = 2.1; // 2.1 x wormhole bonus for manufacturing in wormhole space applied to rig
const tataraWHBonus = 1.1; // 1.1 x wormhole bonus for reactions in wormhole space applied to rig
const materialEfficiencyBonus = ((1 - meForEq) * (1 - stMEForEq) * (1 - (azbelRig * wormholeBonus)))
const reactorEfficiency = 1 - ((tataraRig / 100) * tataraWHBonus);
const BPCMEBonus = (1 - (BPCMaterialEfficiency / 100)) * (1 - 0.01); // 3% for BPC and 1% for Azbel
const reactionSlots = 24;
const totalSalvageRequired = [];
const reactionsQuantities = [];
// main components
for (let i = 0; i < mainComponents.length; i++) {
    const componentRequirements = mainComponents[i].requirements;
    for (let j = 0; j < componentRequirements.length; j++) {
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
// spec components
function processComponents(componentType, numUnits, materialEfficiencyBonus, totalSalvageRequired, reactionsQuantities) {
    const numberOfComponents = numUnits / 4;
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
processComponents(defensive, numUnits, materialEfficiencyBonus, totalSalvageRequired, reactionsQuantities);
processComponents(offensive, numUnits, materialEfficiencyBonus, totalSalvageRequired, reactionsQuantities);
processComponents(propulsion, numUnits, materialEfficiencyBonus, totalSalvageRequired, reactionsQuantities);
processComponents(core, numUnits, materialEfficiencyBonus, totalSalvageRequired, reactionsQuantities);

// console.log(totalSalvageRequired);
// console.log(reactionsQuantities);
// test
// let averageRuns = 0;
// for(let i = 0; i < reactionsQuantities.length; i++){
//     averageRuns += Math.ceil(reactionsQuantities[i].quantity / reactionsQuantities[i].output);
//     // reactionsQuantities[i].runs = runs;
// }
// averageRuns = Math.ceil(averageRuns / reactionSlots);
// console.log("Average number of runs: " + averageRuns);
// for(let i = 0; i < reactionsQuantities.length; i++){
//     console.log(reactionsQuantities[i].name + " " + Math.ceil(reactionsQuantities[i].quantity / reactionsQuantities[i].output));
// }
//end test

for(let i = 0; i < reactionsQuantities.length; i++){
    reactionsQuantities[i].runs = Math.ceil(reactionsQuantities[i].quantity / reactionsQuantities[i].output);
}

const gasRequirements = [];
for (let i = 0; i < reactionsQuantities.length; i++) {
    const runs = Math.ceil(reactionsQuantities[i].quantity / reactionsQuantities[i].output);
    reactionsQuantities[i].runs = runs;
    const reactorEfficiency = 1 - ((tataraRig / 100) * tataraWHBonus);
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
            // console.log(reactionsQuantities[i].name + " " + runs)
            // console.log(reactionsQuantities[i].requirements[j].name + " " + newQty)
        }
    }
}

const slots = 24;

function scheduleReactions(reactions, slots) {
    const schedule = [];
    for (let i = 0; i < slots; i++) {
        schedule.push({
            slot: i,
            numRuns: 0,
            reactionName: "",
        });
    }

    const totalRuns = reactions.reduce((acc, cur) => acc + cur.runs, 0);
    // console.log("Total runs: " + totalRuns);
    let newHighest = Math.ceil(totalRuns / slots);
    for (let i = 0; i < schedule.length; i++) {
        reactions.forEach((reaction) => {
            if (reaction.runs <= Math.ceil(totalRuns / slots) && reaction.runs > 0 && schedule[i].numRuns === 0) {
                schedule[i].numRuns = reaction.runs;
                schedule[i].reactionName = reaction.name;
                reaction.runs = 0;
            }
            if(reaction.runs <= (Math.ceil(totalRuns / slots) * 1.3) && reaction.runs > 0 && schedule[i].numRuns === 0){
                schedule[i].numRuns = reaction.runs;
                schedule[i].reactionName = reaction.name;
                if(newHighest == 0){
                    newHighest = reaction.runs;
                }
                reaction.runs = 0;
            }

            // console.log(newHighest);
            if(reaction.runs / newHighest < 3 && reaction.runs > 0 && schedule[i].numRuns === 0){
                schedule[i].numRuns = newHighest;
                schedule[i].reactionName = reaction.name;
                reaction.runs = reaction.runs - newHighest;
            }

            // if(i > schedule.length / 2){
            //     let updatedRuns = reactions.reduce((acc, cur) => acc + cur.runs, 0);
            //     console.log("updated runs: " + updatedRuns);
            //     newHighest = Math.ceil(updatedRuns / slots - i);
            // }

            if(reaction.runs > 0 && schedule[i].numRuns === 0){
                schedule[i].numRuns = newHighest;
                schedule[i].reactionName = reaction.name;
                reaction.runs = reaction.runs - newHighest;
            }
            
        })

        // reactions.find((reaction) => {
        //     if(reaction.runs <= Math.ceil(totalRuns / slots) && reaction.runs > 0){
        //         schedule[i].numRuns = reaction.runs;
        //         schedule[i].reactionName = reaction.name;
        //         reaction.runs = 0;
        //     }
        // })
    }

    // console.log("schedule runs: " + schedule.reduce((acc, cur) => acc + cur.numRuns, 0));
    return schedule;
}

const schedule = scheduleReactions(reactionsQuantities, slots);
console.log(schedule);

gasRequirements.sort((a, b) => a.type_id - b.type_id);

// console.log(gasRequirements);