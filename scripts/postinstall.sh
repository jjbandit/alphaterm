#! /bin/sh

npm install -g gulp
gulp

./node_modules/.bin/electron-rebuild
