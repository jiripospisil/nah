import Yargs = require("yargs");

import * as log from "../lib/log";
import * as remoteStorage from "../lib/remote_storage";
import * as storage from "../lib/storage";
import * as resolver from "../lib/version_resolver";

async function setCurrentVersion(version: string): Promise<void> {
  try {
    const resolvedVersion = await resolver.resolve(version, remoteStorage);

    if (storage.version(resolvedVersion)) {
      storage.makeCurrent(resolvedVersion);
    } else {
      log.error('Version "%s" is not installed yet. Use "nah install" to install it.', resolvedVersion.human);
    }
  } catch (err) {
    log.error(err.message);
  }
}

function printCurrentVersion(): void {
  const current = storage.current();

  if (current) {
    log.info('The current version is set to "%s" and located at "%s".', current.human, current.path);
  } else {
    log.info('There\'s no version currently set. Use "install" or "current" to set one.');
  }
}

async function handle(argv: { version: string | undefined }): Promise<void> {
  storage.initialize();

  if (argv.version) {
    await setCurrentVersion(argv.version);
  } else {
    printCurrentVersion();
  }
}

export const command = "current [version]";
export const aliases = ["version", "use", "c"];
export const desc = "Print or set the current version";

export function builder(yargs: Yargs.Argv): void {
  yargs.usage("Usage: nah current");
}

export function handler(argv: { version: string | undefined }): void {
  handle(argv).catch((err) => {
    log.error("An unexpected error occured: ", err);
    process.exitCode = 1;
  });
}
