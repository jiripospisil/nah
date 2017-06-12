import * as chalk from "chalk";
import * as util from "util";

const ctx = new chalk.constructor({ enabled: !process.env.NAH_NO_COLOR });

export function info(...args: any[]) {
  console.log(`${ctx.green("•")} ${util.format.apply(null, args)}`);
}

export function error(...args: any[]) {
  console.log(`${ctx.red("•")} ${util.format.apply(null, args)}`);
}
