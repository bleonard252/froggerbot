import * as chalk from 'chalk';
import { createClient, RedisClientType } from 'redis';
import { logError, logFatal } from '../logging/consolelogger';

const uri = process.env.REDIS_URI ?? "redis://localhost:6379";
// //@ts-expect-error
export const db = createClient({url: uri, socket: {tls: false}});
db.on('error', (err) => {
  if (err.code == "ECONNREFUSED") {
    logFatal(chalk.underline`Redis connection error`, err);
    process.exit(8);
  } else {
    logError(chalk.redBright.underline`Redis error`, err);
  }
});