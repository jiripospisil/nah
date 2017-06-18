import Yargs = require("yargs");

import * as log from "../lib/log";
import printVersions from "../lib/print_versions";
import * as remoteStorage from "../lib/remote_storage";
import * as storage from "../lib/storage";

async function handle(channel: string): Promise<void> {
  storage.initialize();

  try {
    const versions = await remoteStorage.versions(channel);
    log.info("Available: ");
    printVersions(versions, ".", ".x.x", process.stdout);
  } catch (err) {
    log.error(`An error occured while fetching the channel's versions: ${err.message}`);
  }
}

export const command = "ls-remote <channel>";
export const desc = "Prints all of the available versions for the given channel.";

export function builder(yargs: Yargs.Argv) {
  yargs.usage("Usage: nah ls-remote release (or nightly, rc...)");
}

export function handler({ channel }: { channel: string }): void {
  handle(channel).catch((err) => {
    log.error("An unexpected error occured: ", err);
    process.exitCode = 1;
  });
}
