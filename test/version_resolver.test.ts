"use strict";

import * as tap from "tap";
import * as resolver from "../src/lib/version_resolver";

{
  const tests = [
    {
      expected: {
        channel: "release",
        full: "release--v8.0.0",
        human: "release/v8.0.0",
        version: "v8.0.0",
      },
      input: "v8",
    },

    {
      expected: {
        channel: "release",
        full: "release--v8.0.0",
        human: "release/v8.0.0",
        version: "v8.0.0",
      },
      input: "v8.0",
    },

    {
      expected: {
        channel: "release",
        full: "release--v8.0.0",
        human: "release/v8.0.0",
        version: "v8.0.0",
      },
      input: "v8.0.0",
    },

    {
      expected: {
        channel: "release",
        full: "release--v8.0.0",
        human: "release/v8.0.0",
        version: "v8.0.0",
      },
      input: "8",
    },

    {
      expected: {
        channel: "release",
        full: "release--v8.0.0",
        human: "release/v8.0.0",
        version: "v8.0.0",
      },
      input: "8.0",
    },

    {
      expected: {
        channel: "release",
        full: "release--v8.0.0",
        human: "release/v8.0.0",
        version: "v8.0.0",
      },
      input: "8.0.0",
    },

    {
      expected: {
        channel: "release",
        full: "release--v8.0.0",
        human: "release/v8.0.0",
        version: "v8.0.0",
      },
      input: "release/v8",
    },

    {
      expected: {
        channel: "release",
        full: "release--v8.0.0",
        human: "release/v8.0.0",
        version: "v8.0.0",
      },
      input: "release/v8.0",
    },

    {
      expected: {
        channel: "release",
        full: "release--v8.0.0",
        human: "release/v8.0.0",
        version: "v8.0.0",
      },
      input: "release/v8.0.0",
    },

    {
      expected: {
        channel: "release",
        full: "release--v8.0.0",
        human: "release/v8.0.0",
        version: "v8.0.0",
      },
      input: "release/8",
    },

    {
      expected: {
        channel: "release",
        full: "release--v8.0.0",
        human: "release/v8.0.0",
        version: "v8.0.0",
      },
      input: "release/8.0",
    },

    {
      expected: {
        channel: "release",
        full: "release--v8.0.0",
        human: "release/v8.0.0",
        version: "v8.0.0",
      },
      input: "release/8.0.0",
    },

    {
      expected: {
        channel: "nightly",
        full: "nightly--v9.0.0-nightly20170607eef94a8bf8",
        human: "nightly/v9.0.0-nightly20170607eef94a8bf8",
        version: "v9.0.0-nightly20170607eef94a8bf8",
      },
      input: "nightly/v9.0.0-nightly20170607eef94a8bf8",
    },

    {
      expected: {
        channel: "chakracore-nightly",
        full: "chakracore-nightly--v9.0.0-nightly2017060890e0c543ce",
        human: "chakracore-nightly/v9.0.0-nightly2017060890e0c543ce",
        version: "v9.0.0-nightly2017060890e0c543ce",
      },
      input: "chakracore-nightly/v9.0.0-nightly2017060890e0c543ce",
    },

    {
      expected: {
        channel: "rc",
        full: "rc--v8.0.0-rc.2",
        human: "rc/v8.0.0-rc.2",
        version: "v8.0.0-rc.2",
      },
      input: "rc/v8.0.0-rc.2",
    },

    {
      expected: {
        channel: "release",
        full: "release--v42.42.42",
        human: "release/v42.42.42",
        version: "v42.42.42",
      },
      input: "release/latest",
    },
  ];

  const remoteStorage = {
    async latest(channel: string): Promise<string> {
      channel = channel;
      return "v42.42.42";
    },

    async versions(channel: string): Promise<string[]> {
      channel = channel;
      throw new Error("Should not be called");
    },
  };

  tests.forEach((test) => {
    tap.test(`resolve: ${test.input}`, (t) => {
      return resolver.resolve(test.input, remoteStorage)
        .then((actual) => t.deepEquals(actual, test.expected));
    });
  });
}

{
  const tests = [
    {
      input: "notaversion",
    },

    {
      input: "a42",
    },

    {
      input: "nightly2/latest",
    },
  ];

  const remoteStorage = {
    async latest(channel: string): Promise<string> {
      channel = channel;
      throw new Error("Invalid version");
    },

    async versions(channel: string): Promise<string[]> {
      channel = channel;
      throw new Error("Should not be called");
    },
  };

  tests.forEach((test) => {
    tap.test(`resolve: ${test.input}`, (t) => {
      return resolver.resolve(test.input, remoteStorage)
        .then(() => t.ok(false))
        .catch(t.end);
    });
  });
}
