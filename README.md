# undo

A command line tool to "undo" common commands.

*Collectively saving ***dozens*** of seconds of peoples' time.*

## Installation

```sh
yarn global add https://github.com/spudtrooper/undo.git
```

## Usage

Run `undo` after another command, e.g. basically:

```sh
yarn add chalk
undo

Command : yarn add chalk
Undo    : yarn remove chalk

Run yarn remove chalk ??? (y/n)? y
```

Runs `yarn remove chalk`

Avoid the prompt with `-f`

```sh
yarn add chalk
undo -f
```

Runs `yarn remove chalk`

## Notes

It won't run *really* destructive commands like `rm` or `rmdir`.
