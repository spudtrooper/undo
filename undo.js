import os from "os";
import fs from "fs";
import path from "path";
import { createInterface } from "readline";
import chalk from "chalk";
import { spawnSync } from "child_process";

const findHistory = (n) => {
  // TODO: This isn't very inclusive, but I don't care.
  const historyFile = path.join(os.homedir(), ".zsh_history");
  if (!fs.existsSync(historyFile)) {
    throw new Error(`History file not found: ${historyFile}`);
  }
  const lines = fs.readFileSync(historyFile, "utf8").split("\n");
  return lines.map(line => {
    // : 1704548192:0;cat ~/.zsh_history
    const m = line.match(/^: (\d+):0;(.*)$/);
    if (!m) return;
    const [, , cmd] = m;
    return cmd;
  }).filter(Boolean);
};

const findCommand = (n) => {
  const commands = findHistory();
  return commands[commands.length - n - 1];
};

const findUndoCommand = (cmd) => {
  const m = cmd.match(/^([a-z]+)(.*)$/);
  if (!m) return;
  const [, cmdName, cmdArgs] = m;

  // touch newfile.txt
  {
    const m = cmd.match(/^touch\s+(.*)$/);
    if (m) {
      const [, filename] = m;
      return `rm ${filename}`;
    }
  }

  // mkdir newdir
  {
    const m = cmd.match(/^mkdir\s+(.*)$/);
    if (m) {
      const [, dirname] = m;
      return `rmdir ${dirname}`;
    }
  }

  // export VAR=value
  {
    const m = cmd.match(/^export\s+(\w+)=.*$/);
    if (m) {
      const [, varname] = m;
      return `unset ${varname}`;
    }
  }

  // alias ll='ls -l'
  {
    const m = cmd.match(/^alias\s+(\w+)=.*$/);
    if (m) {
      const [, name] = m;
      return `unalias ${name}`;
    }
  }

  // mv oldname.txt newname.txt
  {
    const m = cmd.match(/^mv\s+(.*)\s+(.*)$/);
    if (m) {
      const [, oldname, newname] = m;
      return `mv ${newname} ${oldname}`;
    }
  }

  // echo "text" >> file.txt
  {
    const m = cmd.match(/^.*>>\s*(.*)$/);
    if (m) {
      const [, f] = m;
      return `rm ${f}`;
    }
  }

  // cp original.txt copy.txt
  {
    const m = cmd.match(/^cp\s+(\S+)\s+(\S+)/);
    if (m) {
      const [, , copy] = m;
      return `rm ${copy}`;
    }
  }

  // yarn add foo
  {
    const m = cmd.match(/^yarn\s+add\s+(.*)$/);
    if (m) {
      const [, pkg] = m;
      return `yarn remove ${pkg}`;
    }
  }

  // npm add foo
  {
    const m = cmd.match(/^npm\s+add\s+(.*)$/);
    if (m) {
      const [, pkg] = m;
      return `npm remove ${pkg}`;
    }
  }
};

const prompt = (cmd, undoCmd) => {
  return new Promise((resolve, reject) => {
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    console.log();
    console.log(`Command : ${chalk.red(cmd)}`);
    console.log(`Undo    : ${chalk.green(undoCmd)}`);
    console.log();
    readline.question(`Run ${chalk.greenBright(undoCmd)} ??? (y/n)? `, (answer) => {
      if (answer !== "y") {
        console.log("Aborting");
        resolve(false);
        process.exit(1);
      }
      resolve(true);
      readline.close();
    });
  });
};

const realMain = async (opts = {}) => {
  const { force, num, dry_run, verbose } = opts,
    dryRun = !!dry_run;

  const nth = parseInt(num);
  const cmd = findCommand(nth);
  const undoCmd = findUndoCommand(cmd);

  if (!undoCmd) {
    throw new Error(`Undo command not found for command ${nth}: ${cmd}`);
  }

  if (dryRun) {
    console.log(undoCmd);
    return;
  }

  const c = undoCmd.split(/\s+/)[0];
  if (["rm", "rmdir"].includes(c)) {
    throw new Error("You'll have to run this one yourself");
  }

  if (!force) {
    const ans = await prompt(cmd, undoCmd);
    if (!ans) return;
  }

  if (verbose) {
    console.log(`Running ${chalk.greenBright(undoCmd)}...`);
  }
  const { status } = spawnSync(undoCmd, {
    shell: true,
    stdio: "inherit",
  });
  if (status !== 0) {
    throw new Error(`Command failed: ${undoCmd}`);
  }
};

const main = async (opts = {}) => {
  try {
    await realMain(opts);
  } catch ({ message }) {
    console.error(message);
    process.exit(1);
  }
};

export default main;
