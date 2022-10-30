const fs = require('fs');

async function readFile(filePath) {
    return fs.readFileSync(filePath);
}

module.exports = {
    readFile
}