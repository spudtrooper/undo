#!/bin/sh

set -e

msg=${@:-update $(date)}

git add .
git commit -am "$msg"
git push -u
