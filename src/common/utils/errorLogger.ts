import {  format, createLogger, config, transports } from 'winston'
const { combine, timestamp, printf } = format;
const myFormat = printf(({ level, message, timestamp1 }) => `${timestamp1} ${level}: ${message}`);

const CustomLogger = createLogger({
  level: "info",
  levels: config.npm.levels,
  format: combine(format.colorize(), timestamp(), myFormat),
  transports: [new transports.Console()],
});

export default CustomLogger;
