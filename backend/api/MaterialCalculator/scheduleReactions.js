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
        return schedule;
    } else {
        return runScheduleAlgorithm(numAboveMean + 1, sortedReactions, meanRuns, slots);
    }
};

const scheduleReactions = (reactions, slots) => {
    let schedule = false;
    if (slots > 1000) {
        slots = 1000; // Users probably won't need more than 1000 slots but stops trolling
    }
    const sortedReactions = reactions.sort((a, b) => a.runs - b.runs)
    const reacRunsSum = sortedReactions.reduce((acc, curr) => acc + Number(curr.runs), 0);
    const meanRuns = Math.round(reacRunsSum / slots)
    const numAboveMean = 0;
    if (slots <= sortedReactions.length) {
        return sortedReactions;
    } else {
        schedule = runScheduleAlgorithm(numAboveMean + 1, sortedReactions, meanRuns, slots);
    }
    return schedule;
}

module.exports = { scheduleReactions };