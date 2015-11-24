#! /bin/sh

npm install -g gulp
gulp

# Relative symlink enabling easily including
# Alphaterm specific components
ln -s ../lib node_modules

./node_modules/.bin/electron-rebuild
