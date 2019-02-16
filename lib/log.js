const winston = require("winston");
//logger.log("info", "Starting up with config %j", config);

/**
 * Exibe stacktrace
 *
 * @param {*} info
 * @returns
 */
const errorStackFormat = winston.format(info => {
    if (info.message instanceof Error) {
        return Object.assign({}, info, { message: info.message.stack });
        // return Object.assign({}, info, {
        //     stack: info.message.stack,
        //     message: info.message.message
        // });
    }
    return info;
});

/**
 * Formatação básica padrão
 *
 * @param {*} pFormats
 */
const basicFormat = (...pFormats) =>
    winston.format.combine(
        ...pFormats,
        errorStackFormat(),
        // winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf(info => {
            const { timestamp, level, message, ...args } = info;

            const ts = timestamp.slice(0, 19).replace("T", " ");
            return `${ts} [${level}]: ${message} ${
                Object.keys(args).length ? JSON.stringify(args, null, 2) : ""
            }`;
        })
    );

//Formatação para arquivo
const fileFormat = basicFormat();
//Formatação para o console
const consoleFormat = basicFormat(
    winston.format.colorize(),
    winston.format.prettyPrint()
);

//Cria logger
const logger = winston.createLogger({
    level: "sylly",
    format: fileFormat,
    transports: [
        new winston.transports.File({
            filename: "./logs/error.log",
            level: "error",
            handleException: false,
            maxSize: 5242880
        }),
        new winston.transports.File({
            filename: "./logs/all.log",
            level: "silly",
            handleException: false,
            maxSize: 5242880
        })
    ]
});

//Exibe log no console quando não for produção
/*
 * Before running your app, you can do this in console,
 *
 * export NODE_ENV=production
 * Or if you are in windows you could try this:
 *
 * SET NODE_ENV=production
 * or you can run your app like this:
 *
 * NODE_ENV=production node app.js
 * You can also set it in your js file:
 *
 * process.env.NODE_ENV = 'production';
 */
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: consoleFormat,
            level: "silly",
            handleException: false
        })
    );
}

module.exports = logger;
