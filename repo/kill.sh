#!/bin/bash

# Ports to kill
PORTS=(3000 5000)

for PORT in "${PORTS[@]}"; do
  echo "Checking port $PORT..."

  PIDS=$(lsof -ti tcp:$PORT)

  if [ -z "$PIDS" ]; then
    echo "No process found on port $PORT"
  else
    echo "Killing process(es) on port $PORT: $PIDS"
    kill -9 $PIDS
  fi
done
