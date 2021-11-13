#!/bin/bash

CANDY_MACHINE_COMPILE_PATH=/var/www/html/
CANDY_MACHINE_DEPLOY_PATH=/var/www/html/candy-machine-mint
CANDY_MACHINE_BUILD_PATH=/home/happy/candy-machine-mint/build 

echo "Using Build from ${CANDY_MACHINE_BUILD_PATH}"
echo "Deploying CandyMachine to ${CANDY_MACHINE_DEPLOY_PATH}"

echo "Nuking old deployment ${CANDY_MACHINE_DEPLOY_PATH} on Apache." 
sudo rm -rf ${CANDY_MACHINE_DEPLOY_PATH}

echo "Copying the build to ${CANDY_MACHINE_DEPLOY_PATH}" 
sudo cp -r ${CANDY_MACHINE_BUILD_PATH} ${CANDY_MACHINE_DEPLOY_PATH}

echo "Setting ${CANDY_MACHINE_DEPLOY_PATH} permissions to www-data"
sudo chown -R www-data ${CANDY_MACHINE_DEPLOY_PATH}
 