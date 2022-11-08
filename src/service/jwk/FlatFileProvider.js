const fs = require('fs');

function readFile(filePath) {
    return fs.readFileSync(filePath, 'binary');
}

module.exports = {
    readFile
}