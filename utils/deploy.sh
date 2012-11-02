#!/bin/bash

project_dir=$(dirname $0)/..
rsync -acv --no-owner -e "ssh -p 2222" --exclude utils --exclude .project --exclude .git --exclude .settings $project_dir/ root@antportal.com:/srv/karayom
