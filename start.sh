#!/bin/bash

# Start the first process
bun run ./backend/index.ts &

# Start the second process
cd ./ui
bun serve dist -l tcp://0.0.0.0:8004 &
cd ..

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?