import * as child_process from "child_process";
import * as crypto from "crypto";
import * as os from "os";

import Yargs = require("yargs");
import fetch from "node-fetch";

import * as infoBuilder from "../lib/info_builder";
import * as log from "../lib/log";
import * as remoteStorage from "../lib/remote_storage";
import * as storage from "../lib/storage";
import Version from "../lib/version";
import * as resolver from "../lib/version_resolver";

function downloadFile(uri: string): Promise<Buffer> {
  return fetch(uri)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Received HTTP "${response.status}" from the server.`);
      }
      return response;
    })
    .then((response) => response.buffer());
}

async function downloadChecksum(uri: string): Promise<string> {
  log.info(`Downloading checksum from "${uri}"...`);
  return (await downloadFile(uri)).toString("utf-8");
}

function downloadArchive(uri: string): Promise<Buffer> {
  log.info(`Downloading archive from "${uri}"...`);
  return downloadFile(uri);
}

function findChecksum(filename: string, checksum: string): string | null {
  const lines = checksum.split("\n");
  for (const line of lines) {
    const [sha, name] = line.split("  ");
    if (name === filename) {
      return sha;
    }
  }

  return null;
}

function verifyChecksum(filename: string, checksum: string, archive: Buffer): void {
  const sum = findChecksum(filename, checksum);

  if (!sum) {
    throw new Error("Unable to find the corresponding filename in the shasum file.");
  }

  const hash = crypto.createHash("sha256").update(archive).digest("hex");
  if (sum !== hash) {
    throw new Error("The archive is corrupted. Please retry.");
  }
}

function runPostInstallHook() {
  const postInstallHookPath = storage.hook("post_install");

  child_process.spawnSync("sh", [postInstallHookPath], {
    stdio: "inherit",
  });
}

async function installVersion(ver: Version): Promise<void> {
  log.info('Version "%s" is not yet installed. Installing...', ver.human);

  const info = infoBuilder.build(ver);

  try {
    const checksum = await downloadChecksum(info.uris.checksum);
    const archive = await downloadArchive(info.uris.archive);

    log.info("Verifying checksum...");
    verifyChecksum(info.filename, checksum, archive);

    log.info("Extracting...");
    await storage.installVersion(ver, info.name, archive);

    log.info("Setting as current...");
    storage.makeCurrent(ver);

    if (os.platform() !== "win32") {
      log.info("Running the post-install hook...");
      runPostInstallHook();
    } else {
      log.info("Skipping the post-install hook because of an unsupported platform");
    }

    log.info("Finished");
  } catch (err) {
    log.error(`An error occured while installing: ${err}`);
  }
}

async function handle(version: string): Promise<void> {
  storage.initialize();

  const resolvedVersion = await resolver.resolve(version, remoteStorage);

  if (storage.version(resolvedVersion)) {
    log.info('Version "%s" is already installed.', resolvedVersion.human);
    log.info("Setting as current...");
    return storage.makeCurrent(resolvedVersion);
  }

  await installVersion(resolvedVersion);
}

export const command = "install <version>";
export const aliases = ["i"];
export const desc = "Install a specific version of Node.js";

export function builder(yargs: Yargs.Argv) {
  yargs.usage("Usage: nah install <version>");
}

export function handler({ version }: { version: string }): void {
  handle(version).catch((err) => {
    log.error("An unexpected error occured: ", err);
    process.exitCode = 1;
  });
}
