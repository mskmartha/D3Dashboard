#!/bin/bash

echo "----------------------------------"
echo "Installing packages..."
echo ""

cdt2 package install --autofill

echo "----------------------------------"
echo "Linking to chartlib..."
echo ""

cdt2 package link ../../

echo "----------------------------------"
echo "Linking other example applications..."
echo ""

for package in ../*; do
    cdt2 package link $package
done
