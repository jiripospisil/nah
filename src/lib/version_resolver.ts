"use strict";

import RemoteStorage from "./remote_storage";
import Version from "./version";

function result(channel: string, version: string): Version {
  return {
    channel,
    full: `${channel}--${version}`,
    human: `${channel}/${version}`,
    version,
  };
}

async function resolveLatestVersion(channel: string, remoteStorage: RemoteStorage) {
  const latest = await remoteStorage.latest(channel);
  if (!latest) {
    throw new Error(`Unable find a latest version for channel "${channel}".`);
  }
  return result(channel, latest);
}

async function parseVersion(channel: string, version: string, remoteStorage?: RemoteStorage): Promise<Version> {
  if (version === "latest" && remoteStorage) {
    return resolveLatestVersion(channel, remoteStorage);
  }

  if (version.length > 1 && version.indexOf("-") !== -1) {
    return result(channel, version);
  }

  const v = version.startsWith("v") ? version.substr(1) : version;

  // 8 => v8.0.0
  if (/^\d+$/.test(v)) {
    return result(channel, `v${v}.0.0`);
  }

  // 8.1 => v8.1.0
  if (/^\d+\.\d+$/.test(v)) {
    return result(channel, `v${v}.0`);
  }

  // 8.1.2 => v8.1.2
  if (/^\d+\.\d+\.\d+$/.test(v)) {
    return result(channel, `v${v}`);
  }

  throw new Error(`Unable to resolve "${channel}/${version} into a valid Node.js version. Please use the "vX.Y.Z" version scheme.`);
}

export async function resolve(version: string, remoteStorage?: RemoteStorage): Promise<Version> {
  if (!version) {
    throw new Error("Invalid version provided.");
  }

  const slash = version.indexOf("/");

  if (slash === -1) {
    return parseVersion("release", version, remoteStorage);
  }

  return parseVersion(version.slice(0, slash), version.slice(slash + 1), remoteStorage);
}
