const ethers = require('ethers')
const {from, mergeMap, map, filter, toArray } = require('rxjs')

function filterEvent(provider, pairAddr, fromBlock, toBlock) {
	const iface = new ethers.utils.Interface(pairAbi)

	return from(provider.getLogs({
		fromBlock,
		toBlock,
		address: pairAddr,
		topics: ['0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822'] //id("Swap(address,uint256,uint256,uint256,uint256,address)")]
	})).pipe(
		mergeMap(logs => from(logs)),
		map(log => ({
			hash: log.transactionHash,
			sender: iface.parseLog(log).args[0]}
			)),
		filter(data => format('0x01a1cb10e2eaa56c9d29e55df1fff31d150fe86d') !== format(data.sender)),
		map(data => data.sender),
		toArray()
	).toPromise()
}