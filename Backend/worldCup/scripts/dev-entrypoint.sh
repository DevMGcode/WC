#!/bin/sh
set -eu

# Recompile on source/resource changes to trigger DevTools restart
(
  while inotifywait -r -e modify,create,delete,move src/main; do
    mvn -q -DskipTests compile || true
  done
) &

exec mvn -DskipTests spring-boot:run
