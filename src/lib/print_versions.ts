function getVersionPrefix(version: string, separator: string): string | null {
  const index = version.indexOf(separator);
  if (index !== -1) {
    return version.substr(0, index);
  }
  return null;
}

function groupByVersion(versions: string[], separator: string): object {
  return versions.reduce((result: object, version: string) => {
    const prefix = getVersionPrefix(version, separator) || "other";
    if (!result[prefix]) {
      result[prefix] = [];
    }
    result[prefix].push(version);
    return result;
  }, {});
}

function findLongestVersion(versions: string[]): number {
  return versions.reduce((longest: number, version: string) => {
    if (version.length > longest) {
      return version.length;
    }
    return longest;
  }, 0);
}

function padVersion(version: string, longest: number): string {
  if (version.length < longest) {
    return version + " ".repeat(longest - version.length);
  }
  return version;
}

export default function print(versions: string[], separator: string, suffix: string | null, stdout: NodeJS.WritableStream): void {
  const groups = groupByVersion(versions, separator);

  for (const group of Object.keys(groups)) {
    stdout.write(`${group}${suffix ? suffix : ""}:\n`);
    let count = 0;

    const longestVersion = findLongestVersion(groups[group]);
    for (const version of groups[group]) {
      const padded = padVersion(version, longestVersion);
      stdout.write(`\t${padded}`);

      if (++count % 4 === 0) {
        stdout.write("\n");
      }
    }

    stdout.write("\n");
  }
}
