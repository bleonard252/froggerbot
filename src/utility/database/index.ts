import * as chalk from 'chalk';
import { createClient, RedisClientType } from 'redis';
import { logError } from '../logging/consolelogger';

const uri = process.env.REDIS_URI ?? "redis://localhost:6379";
// //@ts-expect-error
export const db = createClient({url: uri, socket: {tls: false}});
db.on('error', (err) => logError(err));
