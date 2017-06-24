import { homedir } from "os";

export const STORAGE_ROOT = process.env.NAH_STORAGE_ROOT || `${homedir()}/.nah`;
export const STORAGE_VERSIONS = process.env.NAH_STORAGE_VERSIONS || `${STORAGE_ROOT}/versions`;
export const STORAGE_CURRENT_VERSION = process.env.NAH_STORAGE_CURRENT_VERSION || `${STORAGE_ROOT}/current`;
export const STORAGE_HOOKS = process.env.NAH_STORAGE_HOOKS || `${STORAGE_ROOT}/hooks`;

export const DOWNLOAD_ROOT = process.env.NAH_DOWNLOAD_ROOT || "https://nodejs.org/download";
export const DOWNLOAD_SHASUM_URI = process.env.NAH_DOWNLOAD_SHASUM_URI || `${DOWNLOAD_ROOT}/%s/SHASUMS256.txt`;
export const DOWNLOAD_ARCHIVE_URI = process.env.NAH_ARCHIVE_URI || `${DOWNLOAD_ROOT}/%s/%s`;
