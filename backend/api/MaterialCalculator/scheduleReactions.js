const runScheduleAlgorithm = (numAboveMean, sortedReactions, meanRuns, slots) => {
    let schedule = [];
    let availableSlots = slots;
    const meanRunsPlusX = meanRuns + numAboveMean;
    for (let i = 0; i < sortedReactions.length; i++) {
        const numberOfInitialRuns = Math.floor(sortedReactions[i].runs / meanRunsPlusX);
        const numberLeftOver = sortedReactions[i].runs - (meanRunsPlusX * numberOfInitialRuns);
        for (let j = 0; j < numberOfInitialRuns; j++) {
            schedule.push({
                name: sortedReactions[i].name,
                runs: meanRunsPlusX,
            });
            availableSlots -= 1;
        }
        if (sortedReactions[i].runs % meanRunsPlusX !== 0) {
            schedule.push({
                name: sortedReactions[i].name,
                runs: numberLeftOver,
            });
            availableSlots -= 1;
        }
    }

    if (availableSlots >= 0) {
        // Upper bound
        return {
            success: true,
            schedule: schedule
        }
    } else {
        return {
            success: false,
            schedule: schedule
        }
    }
};

const scheduleReactions = (reactions, slots) => {
    let schedule = false;
    if (slots > 1000) {
        slots = 1000; // User probably won't have 1000 slots
    }
    const sortedReactions = reactions.sort((a, b) => a.runs - b.runs)
    const reacRunsSum = sortedReactions.reduce((acc, curr) => acc + Number(curr.runs), 0);
    const meanRuns = Math.round(reacRunsSum / slots)
    if (slots <= sortedReactions.length) {
        return {
            success: true,
            schedule: sortedReactions
        }; // Queue can't be optimised
    }

    let numAboveMean = 1;
    let lastFail = 0;
    let lastSuccess = null;

    while(true){
        const {success} = runScheduleAlgorithm(numAboveMean, sortedReactions, meanRuns, slots)
        if(success){
            lastSuccess = numAboveMean;
            break;
        } else {
            lastFail = numAboveMean;
            numAboveMean *= 2; // Exponential
            if(numAboveMean > reacRunsSum){
                lastSuccess = reacRunsSum;
                break;
            }
        }
    }

    let low = lastFail
    let high = lastSuccess

    // Binary search over schedule ranges
    while(low < high){
        const mid = Math.floor((low + high) / 2);
        const {success} = runScheduleAlgorithm(mid, sortedReactions, meanRuns, slots);
        if(success){
            high = mid;
        } else {
            low = mid + 1
        }
    }

    schedule = runScheduleAlgorithm(low, sortedReactions, meanRuns, slots);
    return schedule;
}

module.exports = { scheduleReactions };