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

module.exports = { aggregateItems };