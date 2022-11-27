const winston = require('winston');
require('winston-daily-rotate-file');
const { combine, timestamp, simple, colorize, errors } = winston.format;

let rotate = new (winston.transports.DailyRotateFile)({
    filename: 'townsquare-%DATE%.log',
    dirname: __dirname + '/logs',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
});

const logger = winston.createLogger({
    format: combine(
        errors({ stack: true }),
        colorize(),
        timestamp(),
        simple()
    ),    
    transports: [
        new winston.transports.Console(),
        rotate
    ]
});

module.exports = logger;
