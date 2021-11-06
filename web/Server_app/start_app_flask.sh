#!/bin/bash

pushd $(dirname $0) > /dev/null
export BASEDIR="$(pwd)"
popd  > /dev/null

export FLASK_APP=${BASEDIR}/dirList.py
export FLASK_DEBUG=0

flask run --host=0.0.0.0 --port=8088