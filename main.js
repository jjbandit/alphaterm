var term = require('term.js'),
		express = require('express'),
		expressApp = express();

expressApp.engine('jade', require('jade').__express)
expressApp.set('views', __dirname + "/views");
expressApp.set('view engine', 'jade');

expressApp.use(term.middleware());
expressApp.use(express.static('public'));
expressApp.use(require('express-jquery')('/public/jquery.js'));

expressApp.get('/', function(req, res){
	res.render('index');
});


/*
 * Sockets
 */

var server = require('http').createServer(expressApp);
var io = require('socket.io').listen(server);

var buff = []
  , socket;

io.sockets.on('connect', function(sock) {
  socket = sock;

  socket.on('data', function(data) {
    if (stream) stream.write('IN: ' + data + '\n-\n');
    term.write(data);
  });

  socket.on('disconnect', function() {
    socket = null;
  });

  while (buff.length) {
    socket.emit('data', buff.shift());
  }
});


server.listen(1337);






/*
 * Electron
 */

var electron = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.

require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

electron.on('ready', function() {
  mainWindow = new BrowserWindow({
		width: 800,
		height: 600
	});

  mainWindow.loadUrl('http://localhost:1337/');
	// mainWindow.loadUrl('file://' + __dirname + '/index.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

// Quit when all windows are closed.
electron.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    electron.quit();
  }
});

