'use strict';

let fs = require('fs');
let path = require('path');

let nslogPath = path.win32.resolve('node_modules\\nslog\\build\\Release\\nslog.node');

fs.unlink(nslogPath, () => console.log('removed nslog.node') );
