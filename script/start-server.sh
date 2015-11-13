#!/bin/bash

set -e

# Script to be run from root folder

PORT=8181

if [ -n "$1" ]; then
    PORT=$1
fi

echo "----------------------------------"
echo "Starting server on port ${PORT}"
echo ""

cdt2 serve -p $PORT