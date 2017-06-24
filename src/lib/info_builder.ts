import * as os from "os";
import * as util from "util";

import * as constants from "./constants";
import Version from "./version";

interface Info {
  readonly name: string;
  readonly filename: string;

  readonly uris: {
    readonly archive: string;
    readonly checksum: string;
  };
}

export function build(version: Version): Info {
  const platform = os.platform();
  const arch = os.arch();
  const ext = platform === "win32" ? "zip" : "tar.gz";
  const platformForRealsies = platform === "win32" ? "win" : platform;
  const archForRealsies = arch === "ia32" ? "x86" : arch;

  const name = `node-${version.version}-${platformForRealsies}-${archForRealsies}`;
  const filename = `${name}.${ext}`;

  const uris = {
    archive: util.format(constants.DOWNLOAD_ARCHIVE_URI, version.human, filename),
    checksum: util.format(constants.DOWNLOAD_SHASUM_URI, version.human),
  };

  return { name, filename, uris };
}
