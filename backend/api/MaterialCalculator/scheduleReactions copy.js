// this code is fucking sick

const runScheduleAlgorithm = (percentageStep, sortedReactions, meanRuns, slots, minimumAllowedEmptySlots, mode) => {
    let schedule = [];
    let availableSlots = slots;
    const meanRunsPlusXPercent = Math.round(((meanRuns / 100) * percentageStep) + meanRuns);
    for (let i = 0; i < sortedReactions.length; i++) {
        const numberOfInitialRuns = Math.floor(sortedReactions[i].runs / meanRunsPlusXPercent);
        const numberLeftOver = sortedReactions[i].runs - (meanRunsPlusXPercent * numberOfInitialRuns);
        for (let j = 0; j < numberOfInitialRuns; j++) {
            schedule.push({
                name: sortedReactions[i].name,
                runs: meanRunsPlusXPercent,
            });
            availableSlots -= 1;
        }
        if (sortedReactions[i].runs % meanRunsPlusXPercent !== 0) {
            schedule.push({
                name: sortedReactions[i].name,
                runs: numberLeftOver,
            });
            availableSlots -= 1;
        }
    }

    if (mode === "strict") {
        if (availableSlots != minimumAllowedEmptySlots) {
            if (percentageStep < 200) {
                return runScheduleAlgorithm(percentageStep + 1, sortedReactions, meanRuns, slots, minimumAllowedEmptySlots, "strict");
            } else {
                return runScheduleAlgorithm(0, sortedReactions, meanRuns, slots, 1, "liberal");
            }
        } else {
            return schedule;
        }
    }

    if (mode === "liberal") {
        if (availableSlots >= 0 && availableSlots >= minimumAllowedEmptySlots) {
            return schedule;
        } else {
            if (percentageStep < 200) {
                return runScheduleAlgorithm(percentageStep + 1, sortedReactions, meanRuns, slots, 1, "liberal");
            }
        }
    }
};

const scheduleReactions = (reactions, slots) => {
    let schedule = false;

    if(slots > 120){
        slots = 120; // restricting a bullshit number of slots here
    }
    const sortedReactions = reactions.sort((a, b) => a.runs - b.runs)
    const reacRunsSum = sortedReactions.reduce((acc, curr) => acc + Number(curr.runs), 0);
    const meanRuns = Math.round(reacRunsSum / slots)
    let percentageChange = 0;

    if(slots <= sortedReactions.length){
        return sortedReactions;
    } else {
        const minimumAllowedEmptySlots = 0;
        schedule = runScheduleAlgorithm(percentageChange, sortedReactions, meanRuns, slots, minimumAllowedEmptySlots, "strict")
    }

    return schedule;
}

module.exports = {scheduleReactions};