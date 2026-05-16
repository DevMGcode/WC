#!/bin/sh
set -eu

# Recompile on source/resource changes to trigger DevTools restart.
# This restarts only the Spring app context, not the Docker container.
(
  while inotifywait -r -e modify,create,delete,move src/main; do
    mvn -q -DskipTests -T 1C compile || true
  done
) &

exec mvn -DskipTests spring-boot:run
