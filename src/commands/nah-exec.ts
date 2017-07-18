import * as child_process from "child_process";

import Yargs = require("yargs");

import * as log from "../lib/log";
import * as storage from "../lib/storage";
import * as resolver from "../lib/version_resolver";

function removeEntry(entry: string, path: string): string {
  return path
    .split(":")
    .filter((part) => part !== entry)
    .join(":");
}

function prependEntry(entry: string, path: string): string {
  const parts = path.split(":");
  parts.unshift(entry);
  return parts.join(":");
}

// TODO: If no version was provided, it could look for .nahrc files in the tree
// to determine the version.
async function handle(version: string): Promise<void> {
  try {
    const resolvedVersion = await resolver.resolve(version);

    const commands = process.argv.slice(4);
    if (!commands.length) {
      return;
    }

    if (storage.version(resolvedVersion)) {
      const versionPath = storage.which(resolvedVersion);

      const current = storage.current();

      if (current) {
        process.env.PATH = removeEntry(`${current.path}/bin`, process.env.PATH);
      }

      process.env.PATH = prependEntry(`${versionPath}/bin`, process.env.PATH);

      const executable = commands[0];
      const args = commands.slice(1);

      child_process.spawn(executable, args, {
        stdio: "inherit",
      });
    } else {
      log.error('Version "%s" is not installed yet. Use "nah install" to install it.', resolvedVersion.human);
    }
  } catch (err) {
    // TODO: Be more granular
    log.error(err.message);
  }
}

export const command = "exec <version>";
export const aliases = ["e"];
export const desc = "Executes the command with the given Node.js version";

export function builder(yargs: Yargs.Argv) {
  yargs.usage("Usage: nah exec <version>");
}

export function handler({ version }: { version: string }): void {
  handle(version).catch((err) => {
    log.error("An unexpected error occured: ", err);
    process.exitCode = 1;
  });
}
