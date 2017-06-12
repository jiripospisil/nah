import Yargs = require("yargs");

import * as log from "../lib/log";
import * as storage from "../lib/storage";

function handle() {
  storage.initialize();

  const current = storage.current();
  log.info(`Current: ${current ? current.human : "Not set"}`);
  log.info(`Installed: ${storage.versions().map((v) => v.human).join(", ")}`);
}

export const command = "ls";
export const desc = "Prints all of the installed versions.";

export function builder(yargs: Yargs.Argv) {
  yargs.usage("Usage: nah ls");
}

export function handler(): void {
  try {
    handle();
  } catch (err) {
    log.error("An unexpected error occured: ", err);
    process.exitCode = 1;
  }
}
