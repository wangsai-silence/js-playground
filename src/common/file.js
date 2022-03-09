const lineReader = require('line-reader');

// write file
let logger = fs.createWriteStream(signFile, {
    flags: 'a' // 'a' means appending (old data will be preserved)
})
logger.write(`${nonce}, ${signed.rawTransaction}\n`)

//read file
lineReader.eachLine(signFile, async function(line, last) {
    console.log(line)
    if (last) {
        //finally here
    }
})