const winston = require('winston');

const logger = winston.createLogger({

    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(), //support for message templating
        winston.format.json() //logging all message in json
    ),
    defaultMeta: { service: 'post-service' },
    transports: [ //output destinations for the logs
        new winston.transports.Console({ //logs will appear in terminal with the given format
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: 'identity-service-error.log',
            level: 'error'
        }),
        new winston.transports.File({
            filename: 'combined.log'
        })
    ]

})

module.exports = logger;