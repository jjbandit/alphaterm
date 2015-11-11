require('crash-reporter').start();

var term            = require('term.js'),
    pty             = require('pty.js'),

    // Heavy lifters
    express         = require('express'),
    expressApp      = express(),
    jade            = require('jade'),
    server          = require('http').createServer(expressApp),
    io              = require('socket.io')(server);

    // Electron specific modules
    electron        = require('app'),             // Module to control application life.
    BrowserWindow   = require('browser-window');  // Module to create native browser window.

expressApp.engine('jade', require('jade').__express);
expressApp.set('views', __dirname + "/views");
expressApp.set('view engine', 'jade');

expressApp.use(term.middleware());
expressApp.use(express.static('lib/script'));
expressApp.use(express.static('lib/classes'));
expressApp.use(express.static('lib/components'));
expressApp.use(express.static('lib/stores'));
expressApp.use(express.static('src/style'));

expressApp.get('/', function(req, res){
  res.render('index');
});

expressApp.get('/term', function(req, res){
  res.render('term');
});

expressApp.post('/', function(req, res){
  res.render('index');
});

var socket,
    buff = [];




io.on('connect', function(sock) {

  socket = sock;

  term = pty.fork(process.env.SHELL || 'sh', [], {
    name: require('fs').existsSync('/usr/share/terminfo/x/xterm-256color')
      ? 'xterm-256color'
      : 'xterm',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME
  });

  term.on('data', function(data) {
      socket.emit('data', data);
  });

  socket.on('data', function(data) {
    // console.log(JSON.stringify(data));
    term.write(data);
  });

  socket.on('disconnect', function() {
    socket = null;
  });

});

server.listen(1337);

/*
 * Electron
 */

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

electron.on('ready', function() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });

  mainWindow.loadUrl('http://localhost:1337');

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

electron.commandLine.appendSwitch('force-device-scale-factor', '1.5');
