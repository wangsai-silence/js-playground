const log4js = require('log4js')
const log4jsEx = require('log4js-extend')

const init = function init() {

    log4js.configure({
        appenders: {
            std: {
                type: 'console'
            },
            filter: {
                type: 'logLevelFilter',
                level: 'info',
                appender: 'std',
            },
            file: {
                type: 'file',
                filename: './logs/back.log',
                maxLogSize: 10485760,
                backups: 10,
                pattern: '.yyyy-MM-dd',
                compress: true
            }
        },
        categories: {
            default: {
                appenders: [
                    'file',
                    'filter'
                ],
                level: 'debug'
            }
        }
    });
    log4jsEx(log4js, {
        path: '.',
        format: '[@name @file:@line:@column]'
    })
    log4js.getLogger().info('Logger config finished');
}

module.exports = {
    init
}