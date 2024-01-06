#!/bin/sh

scripts=$(dirname "$0")
root=$(realpath "$scripts/..")
$root/index.js "$@"
