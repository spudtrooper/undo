#!/usr/bin/env node

import { program } from "commander";

import undo from "./undo.js";

program
  .version("0.0.1")
  .description("The cli CLI");

program
  .command("undo", { isDefault: true })
  .option("-f, --force", "Don't prompt for confirmation")
  .option("-n, --num", "The cardinality of the command to undo, for the 1st this should be 1, 2nd...2, so on", 1)
  .option("-d, --dry_run", "Don't actually run the command, just print it")
  .option("-v, --verbose", "Print verbose output")
  .action(undo);

program.parse(process.argv);
