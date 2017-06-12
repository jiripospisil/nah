import * as tap from "tap";
import * as remote from "../src/lib/remote_storage";

// TODO: These exercise pretty much just the APIs, not the returned data which
// is assumed correct. Ideally this would mock the HTTP requests and assert
// against it but then again the tests might get behind the actual server
// responses. Hm.

tap.test("versions: returns a list of all versions for the given channel", (t) => {
  return remote.versions("release").then((versions) => {
    tap.assert(versions.length > 0);
    t.end();
  });
});

tap.test("versions: rejects with an invalid channel", (t) => {
  return remote.versions("Idonotexist").catch(() => {
    t.end();
  });
});

tap.test("latest: returns the latest version of the given channel", (t) => {
  return remote.latest("release").then((version) => {
    tap.assert(!!version);
    t.end();
  });
});

tap.test("latest: rejects with an invalid channel", (t) => {
  return remote.latest("Idonotexist").catch(() => {
    t.end();
  });
});
