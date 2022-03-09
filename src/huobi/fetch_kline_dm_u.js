const axios = require('axios')
const {
    from,
    mergeMap,
    firstValueFrom,
    toArray,
    map,
    tap,
    filter,
    take,
    retry,
    retryWhen,
    delay,
    throwError,
    delayWhen,
    of
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
    let result = new Array()
    let needBreak = false
    let startTime = 1640966400 - 60 * 7

    while (true) {
        if (needBreak) {
            break
        }

        let url = `https://api.hbdm.com/swap-ex/market/history/kline?contract_code=${symbol.toUpperCase()}-USD&period=1min&from=${startTime}&to=${startTime + 60 * 9}`
        startTime += 60 * 60 * 24

        let items = await firstValueFrom(
            from(axios.default.get(url)).pipe(
                mergeMap(resp => {
                    if (resp && resp.data && resp.data.data) {
                        return from(resp.data.data)
                    } else {
                        console.log(`${symbol}, response status: ${resp.status}, response data: ${JSON.stringify(resp.data) }`)
                        return of(1).pipe(
                            delay(Math.ceil(Math.random() * 5000)),
                            mergeMap(x => throwError('no response'))
                        )
                    }
                }),
                retry(50000),
                map(item => ({
                    // id: item.id, 
                    symbol: symbol,
                    open: item.open,
                    close: item.close,
                    low: item.low,
                    high: item.high,
                    time: item.id
                })),
                toArray(),
            )
        )

        needBreak = items.length === 0

        result.push(...items)
    }

    return result

}

function main() {
    from(getSymbols()).pipe(
            mergeMap(symbols => from(symbols)),
            map(item => item.bc),
            filter(item => item && item.endsWith('3l')),
            map(item => item.substring(0, item.length - 2)),
            mergeMap(currency => fetchAllTime(currency), 3),
            mergeMap(data => dbClient.kline.createMany({
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