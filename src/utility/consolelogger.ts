// Log stuff to the console.

import * as chalk from "chalk";
import * as util from "util";

function _log(message: string | object, line1: string, line2: chalk.Chalk) {
  const now = new Date(Date.now());
  const nowf = ``; //chalk.gray.italic.dim`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")} `
  console.error(line1+" "+nowf
    +chalk.white(typeof message === "string" ? message : util.inspect(message)).replaceAll("\n", 
      "\n"+line2`   : `+" " // and the content for each additional line goes here
    )
  )
}

export function logError(message: any) {
  _log(message, chalk.bgBlack.redBright` ERR `, chalk.bgBlack.red)
}
export function logSuccess(message: any) {
  _log(message, chalk.bgBlack.greenBright` SUC `, chalk.bgBlack.green)
}
export function logInfo(message: any) {
  _log(message, chalk.bgBlack.blueBright` INF `, chalk.bgBlack.blue)
}
export function logWarn(message: any) {
  _log(message, chalk.bgBlack.yellowBright` WRN `, chalk.bgBlack.yellow)
}
export function logDebug(message: any) {
  _log(message, chalk.bgBlack.gray` DBG `, chalk.bgBlack.gray)
}
