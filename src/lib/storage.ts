import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as tar from "tar";

import * as constants from "./constants";
import * as templates from "./templates";
import Version from "./version";

export function initialize() {
  mkdirp.sync(constants.STORAGE_VERSIONS);
  mkdirp.sync(constants.STORAGE_HOOKS);

  const postInstallHook = hook("post_install");
  if (!fs.existsSync(postInstallHook)) {
    fs.writeFileSync(postInstallHook, templates.hooks.post_install, "utf-8");
    fs.chmodSync(postInstallHook, "0755");
  }
}

export function hook(name: string) {
  if (name === "post_install") {
    return path.join(constants.STORAGE_HOOKS, "post_install.sh");
  }

  throw new Error("Unknown hook.");
}

export function split(text: string, char: string): string[] {
  const pos = text.indexOf(char);
  if (pos === -1) {
    return [text];
  }

  return [text.substr(0, pos), text.substr(pos + 2)];
}

export function versions(): Version[] {
  return fs.readdirSync(constants.STORAGE_VERSIONS)
    .filter((ver) => {
      const p = path.join(constants.STORAGE_VERSIONS, ver);
      const stat = fs.statSync(p);
      return stat.isDirectory();
    })
    .map((ver) => {
      const [channel, versionName] = split(ver, "--");

      return {
        channel,
        full: `${channel}--${versionName}`,
        human: `${channel}/${versionName}`,
        path: path.resolve(constants.STORAGE_VERSIONS, ver),
        version: versionName,
      };
    })
    .sort()
    .reverse();
}

export function version(ver: Version): Version | null {
  const v = versions().find((c) => c.full === ver.full);
  return v ? v : null;
}

export function which(ver: Version): string | null {
  const v = version(ver);

  if (v) {
    return v.path!;
  }

  return null;
}

export function current(): Version | null {
  try {
    const p = fs.realpathSync(constants.STORAGE_CURRENT_VERSION);
    const [channel, versionName] = split(path.basename(p), "--");

    return {
      channel,
      full: `${channel}--${versionName}`,
      human: `${channel}/${versionName}`,
      path: p,
      version: versionName,
    };
  } catch (err) {
    if (err.code === "ENOENT") {
      return null;
    }

    throw err;
  }
}

export function makeCurrent(ver: Version): void {
  const p = which(ver);

  if (!p) {
    throw new Error(`Version "${ver.human}" not installed.`);
  }

  try {
    fs.unlinkSync(constants.STORAGE_CURRENT_VERSION);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  fs.symlinkSync(p, constants.STORAGE_CURRENT_VERSION);
}

export function installVersion(ver: Version, name: string, archivePath: string): void {
  tar.extract({ file: archivePath, sync: true, cwd: constants.STORAGE_VERSIONS });

  const oldName = path.join(constants.STORAGE_VERSIONS, name);
  const newName = path.join(constants.STORAGE_VERSIONS, ver.full);
  fs.renameSync(oldName, newName);
}
