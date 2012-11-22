#!/bin/bash

project_dir=$(dirname $0)/..
sed -f "${project_dir}/utils/json2js.sed" -i "${project_dir}/assets/maps/level1.json.js"
