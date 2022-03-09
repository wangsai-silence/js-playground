const decoder = require('abi-decoder')
const abi = require('./abi.json')
const ethers = require('ethers')
const provider = ethers.getDefaultProvider('https://mainnet.infura.io/v3/c089f8ed1d7344f38393cee5426287b8')
async function decodeInput() {
    let tx = await provider.getTransaction('0x2546a3d2e5574d1febd18fabf097d0413062a4584e4e7d2adf142390cc0e14c6')
    // console.log(tx)
    decoder.addABI(abi)
    let data = decoder.decodeMethod(tx.data)
    console.log(JSON.stringify(data, '', ' '))
}
async function decodeEvent() {
    let tx = await provider.getTransactionReceipt('0x2546a3d2e5574d1febd18fabf097d0413062a4584e4e7d2adf142390cc0e14c6')
    // console.log(tx)
    decoder.addABI(abi)
    let data = decoder.decodeLogs(tx.logs)
    console.log(JSON.stringify(data, '', ' '))
}
async function main() {
    await decodeInput()
    await decodeEvent()
}
main().then().catch(console.error)