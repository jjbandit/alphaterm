var electron = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.

var express = require('express');
var expressApp = express();

var term = require('term.js');
expressApp.use(term.middleware());

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

var server = require('http').createServer(expressApp);


expressApp.get('/term', function(req, res){
	res.sendfile(__dirname + '/term/term.html');
});


expressApp = expressApp.listen(8080);

var io = require('socket.io')(expressApp);
io = io.listen(server);

io.sockets.on('connection', function(sock) {
  socket = sock;

  socket.on('data', function(data) {
    if (stream) stream.write('IN: ' + data + '\n-\n');
    //console.log(JSON.stringify(data));
    term.write(data);
  });

  socket.on('disconnect', function() {
    socket = null;
  });

  // while (buff.length) {
  //   socket.emit('data', buff.shift());
  // }
});

// Quit when all windows are closed.
electron.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    electron.quit();
  }
});

electron.on('ready', function() {
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  termWindow = new BrowserWindow({width: 800, height: 600});
  termWindow.loadUrl('http://localhost:8080/term');

	termWindow.on('closed', function () {
		termWindow=null;
	})
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
