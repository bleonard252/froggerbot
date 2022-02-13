// Log stuff to the console.

import * as chalk from "chalk";
import * as util from "util";

function _log(message: Array<string | object>, line1: string, line2: chalk.Chalk) {
  const now = new Date(Date.now());
  const nowf = ``; //chalk.gray.italic.dim`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")} `
  var sections = [];
  for (const sect of message) {
    sections.push(
      chalk.white(typeof sect === "string" ? sect : util.inspect(sect)).replaceAll("\n", 
      "\n"+line2`   : `+" ") // and the content for each additional line goes here
    )
  }
  console.error(line1+" "+nowf
    + sections.join("\n"+line2` : : `+" ")
  );
}

export function logError(...message: any) {
  _log(message, chalk.bgBlack.redBright` ERR `, chalk.bgBlack.red)
}
export function logFatal(...message: any) {
  _log(message, chalk.bgBlack.redBright.inverse` ERR `, chalk.bgBlack.red.inverse)
}
export function logSuccess(...message: any) {
  _log(message, chalk.bgBlack.greenBright` SUC `, chalk.bgBlack.green)
}
export function logInfo(...message: any) {
  if (process.env.NODE_ENV != "production")
  _log(message, chalk.bgBlack.blueBright` INF `, chalk.bgBlack.blue)
}
export function logWarn(...message: any) {
  _log(message, chalk.bgBlack.yellowBright` WRN `, chalk.bgBlack.yellow)
}
export function logDebug(...message: any) {
  if (process.env.NODE_ENV == "development")
  _log(message, chalk.bgBlack.gray` DBG `, chalk.bgBlack.gray)
}
