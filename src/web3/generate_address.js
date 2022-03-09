const ethers = require('ethers')

const node = ethers.utils.HDNode.fromMnemonic(ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(16)))

const subAccount = new ethers.Wallet(node.derivePath(`m/44'/60'/0'/0/3`))
console.log(subAccount.privateKey)
console.log(subAccount.address)