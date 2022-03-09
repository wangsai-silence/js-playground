const axios = require('axios')
const {
    from,
    mergeMap,
    firstValueFrom,
    toArray,
    map,
    tap,
    filter
} = require('rxjs')
const {
    PrismaClient
} = require('@prisma/client')

const dbClient = new PrismaClient()


function getSymbols() {
    let url = "https://api.huobi.pro/v2/settings/common/symbols"

    return firstValueFrom(
        from(axios.default.get(url)).pipe(
            map(resp => resp.data.data)
        )
    )
}


async function fetchAllTime(symbol) {
    let limit = 10
    let fromId = 0

    let result = new Array()
    let needBreak = false
    let deadline = 1640966400

    while (true) {
        if (needBreak) {
            break
        }

        let url = `https://www.huobi.com/-/x/hbg/v1/etp/rebalance?from=${fromId}&direct=1&limit=${limit}&currency=${symbol}`
        let items = await firstValueFrom(
            from(axios.default.get(url)).pipe(
                mergeMap(resp => from(resp.data.data)),
                tap(item => fromId = item.id - 1),
                map(item => ({
                    // id: item.id, 
                    symbol: item.currency,
                    before: parseFloat(item.leverageBefore),
                    after: parseFloat(item.leverageAfter),
                    time: Math.floor(item.rebalanceTime / 1000)
                })),
                tap(item => needBreak = item.time <= deadline),
                toArray(),
            )
        )

        result.push(...items)
    }

    return result

}

function main() {
    from(getSymbols()).pipe(
            mergeMap(symbols => from(symbols)),
            map(item => item.bc),
            filter(item => item && item.endsWith('3l')),
            tap(console.log),
            mergeMap(currency => fetchAllTime(currency), 3),
            mergeMap(data => dbClient.etp.createMany({
                data,
                skipDuplicates: true
            })),
        )
        .subscribe({
            next: console.log,
            error: console.error,
        })
}

main()