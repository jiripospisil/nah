import fetch from "node-fetch";
import * as constants from "./constants";

export interface RemoteStorage {
  versions(channel: string): Promise<string[]>;
  latest(channel: string): Promise<string | undefined>;
}

export default RemoteStorage;

export async function versions(channel: string): Promise<string[]> {
  const response = await fetch(`${constants.DOWNLOAD_ROOT}/${channel}/index.json`);
  const json = await response.json<Array<{ version: string }>>();
  return json.map((version) => version.version);
}

export async function latest(channel: string): Promise<string | undefined> {
  const vers = await versions(channel);
  return vers[0];
}
