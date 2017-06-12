import Yargs = require("yargs");

import * as log from "../lib/log";
import * as remoteStorage from "../lib/remote_storage";
import * as storage from "../lib/storage";
import * as resolver from "../lib/version_resolver";

async function handle(argv: { version: string | undefined }): Promise<void> {
  storage.initialize();

  const ver = argv.version;

  if (!ver) {
    const current = storage.current();
    if (current) {
      return log.info(current.path);
    }

    return log.error('No version explicitly specified and no "current" version set');
  }

  try {
    const resolvedVersion = await resolver.resolve(ver, remoteStorage);

    const v = storage.version(resolvedVersion);

    if (v) {
      return log.info(v.path);
    }

    return log.error('Version "%s" is not installed.', resolvedVersion.human);
  } catch (err) {
    return log.error(err.message);
  }
}

export const command = "which [version]";
export const aliases = ["w"];
export const desc = "Print a path to the requested version. Omit the version to get path to the \"current\" version.";

export function builder(yargs: Yargs.Argv) {
  yargs.usage("Usage: nah which [version]");
}

export function handler(argv: { version: string | undefined }): void {
  handle(argv).catch((err) => {
    log.error("An unexpected error occured: ", err);
    process.exitCode = 1;
  });
}
