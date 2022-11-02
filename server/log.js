const winston = require('winston');
require('winston-daily-rotate-file');

let rotate = new (winston.transports.DailyRotateFile)({
    filename: 'townsquare-%DATE%.log',
    dirname: __dirname + '/logs',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
});

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({ json: false, timestamp: true }),
        rotate
    ]
});

module.exports = logger;
