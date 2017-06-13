#!/usr/bin/env node

"use strict";

import * as path from "path";
import * as yargs from "yargs";

yargs
    .usage("Usage: nah <command> [options]")
    .commandDir(path.resolve(__dirname, "../commands"))
    .demandCommand(1)
    .wrap(100)
    .version()
    .recommendCommands()
    .help()
    .epilogue("For more information, look at the documentation at https://github.com/jiripospisil/nah")
    .argv; // tslint:disable-line
