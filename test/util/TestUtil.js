function getClone(VALID_REQUEST) {
    return JSON.parse(JSON.stringify(VALID_REQUEST));
}

module.exports = {
    getClone
}