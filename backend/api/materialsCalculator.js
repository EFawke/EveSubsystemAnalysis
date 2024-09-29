const { mainComponents, defensive, offensive, core, propulsion } = require('./MaterialCalculator/staticVars.js');

let numUnits = 88;
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
function calculateSpecComponentRequirements(componentType, numUnits, materialEfficiencyBonus, totalSalvageRequired, reactionsQuantities) {
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

calculateSpecComponentRequirements(defensive, numUnits, materialEfficiencyBonus, totalSalvageRequired, reactionsQuantities);
calculateSpecComponentRequirements(offensive, numUnits, materialEfficiencyBonus, totalSalvageRequired, reactionsQuantities);
calculateSpecComponentRequirements(propulsion, numUnits, materialEfficiencyBonus, totalSalvageRequired, reactionsQuantities);
calculateSpecComponentRequirements(core, numUnits, materialEfficiencyBonus, totalSalvageRequired, reactionsQuantities);

// console.log(totalSalvageRequired);
// console.log(reactionsQuantities);
// test
// let averageRuns = 0;
// for(let i = 0; i < reactionsQuantities.length; i++){
//     // averageRuns += Math.ceil(reactionsQuantities[i].quantity / reactionsQuantities[i].output);
//     reactionsQuantities[i].runs = runs;
// }
// averageRuns = Math.ceil(averageRuns / reactionSlots);
// console.log("Average number of runs: " + averageRuns);
// for(let i = 0; i < reactionsQuantities.length; i++){
//     console.log(reactionsQuantities[i].name + " " + Math.ceil(reactionsQuantities[i].quantity / reactionsQuantities[i].output));
// }
//end test

for (let i = 0; i < reactionsQuantities.length; i++) {
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
            console.log(reactionsQuantities[i].name + " " + runs)
            console.log(reactionsQuantities[i].requirements[j].name + " " + newQty)
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
            if (reaction.runs <= (Math.ceil(totalRuns / slots) * 1.3) && reaction.runs > 0 && schedule[i].numRuns === 0) {
                schedule[i].numRuns = reaction.runs;
                schedule[i].reactionName = reaction.name;
                if (newHighest == 0) {
                    newHighest = reaction.runs;
                }
                reaction.runs = 0;
            }

            // console.log(newHighest);
            if (reaction.runs / newHighest < 3 && reaction.runs > 0 && schedule[i].numRuns === 0) {
                schedule[i].numRuns = newHighest;
                schedule[i].reactionName = reaction.name;
                reaction.runs = reaction.runs - newHighest;
            }

            // if(i > schedule.length / 2){
            //     let updatedRuns = reactions.reduce((acc, cur) => acc + cur.runs, 0);
            //     console.log("updated runs: " + updatedRuns);
            //     newHighest = Math.ceil(updatedRuns / slots - i);
            // }

            if (reaction.runs > 0 && schedule[i].numRuns === 0) {
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
// console.log(schedule);

gasRequirements.sort((a, b) => a.type_id - b.type_id);

// console.log(gasRequirements);