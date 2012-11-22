#!/bin/bash

project_dir=$(dirname $0)/..
sed -f - -i "${project_dir}/assets/maps/level1.json.js" <<-"EOF"
1 i\
define(function(){return(
$ a\
);});
EOF
