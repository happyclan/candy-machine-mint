#!/bin/bash

CANDY_MACHINE_SOURCE_PATH=/home/happy/candy-machine-mint
CANDY_MACHINE_BUILD_PATH=/home/happy/candy-machine-mint/build 

echo "Nuking old build director at ${CANDY_MACHINE_BUILD_PATH}"
rm -rf ${CANDY_MACHINE_BUILD_PATH}

echo "Building in ${CANDY_MACHINE_SOURCE_PATH}"
yarn --cwd ${CANDY_MACHINE_SOURCE_PATH} build

echo "Fixing the path in index.html"

 
