import Yargs = require("yargs");

import * as child_process from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

import * as chalk from "chalk";
import fetch, { Response } from "node-fetch";
import * as ProgressBar from "progress";
import * as tmp from "tmp";

import * as infoBuilder from "../lib/info_builder";
import * as log from "../lib/log";
import * as remoteStorage from "../lib/remote_storage";
import * as storage from "../lib/storage";
import Version from "../lib/version";
import * as resolver from "../lib/version_resolver";

interface ResponseState {
  uri: string;
  response: Response;
}

tmp.setGracefulCleanup();

function createTmpFileStream(name: string) {
  const tmpDir = tmp.dirSync();
  const filename = path.join(tmpDir.name, name);

  return {
    path: filename,
    stream: fs.createWriteStream(filename),
  };
}

function downloadFile(uri: string, file: fs.WriteStream): Promise<ResponseState> {
  return fetch(uri)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Received HTTP "${response.status}" from the server.`);
      }
      return response;
    })
    .then((response) => {
      response.body.pipe(file);
      return { uri, response };
    });
}

function progressBar({ uri, response }: ResponseState) {
  const length = parseInt(response.headers.get("content-length"), 10);

  if (length) {
    const bar = new ProgressBar(`${chalk.green("•")} Downloading "${uri}" [:bar] :percent :etas`, {
      complete: "=",
      incomplete: " ",
      renderThrottle: 32,
      total: length,
      width: 20,
    });

    response.body.on("data", (chunk: Buffer) => bar.tick(chunk.length));
  } else {
    log.info(`Downloading "${uri}"`);
  }

  return new Promise((resolve) => response.body.on("end", resolve));
}

async function download(uri: string, name: string): Promise<string> {
  const { path, stream } = createTmpFileStream(name);
  await downloadFile(uri, stream).then(progressBar);
  return path;
}

async function downloadChecksum(uri: string): Promise<string> {
  return await download(uri, "checksum");
}

async function downloadArchive(uri: string): Promise<string> {
  return await download(uri, "archive");
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
    const checksumPath = await downloadChecksum(info.uris.checksum);
    const archivePath = await downloadArchive(info.uris.archive);

    const checksum = fs.readFileSync(checksumPath, "utf-8");
    const archive = fs.readFileSync(archivePath);

    log.info("Verifying checksum...");
    verifyChecksum(info.filename, checksum, archive);

    log.info("Extracting...");
    storage.installVersion(ver, info.name, archivePath);

    log.info("Setting as current...");
    storage.makeCurrent(ver);

    log.info("Running the post-install hook...");
    runPostInstallHook();

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
