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

expressApp.get('/', (req, res) => {
  res.render('index');
});

server.listen(1337);

// Global list of terminals that have been instantiated
var terms = [];

io.on('connect', (socket) => {
    // console.log('server socket connected');

    socket.on('create-term', (cb) => {
      new Terminal(socket, cb);
    });
});

/*
 * Electron
 */
var mainWindow = null;

electron.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });

  mainWindow.loadUrl('http://localhost:1337');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

});

// Quit when all windows are closed.
electron.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    electron.quit();
  }
});

electron.commandLine.appendSwitch('force-device-scale-factor', '1.5');


/**
 *  Term.js
 */

function Terminal(sock, callback) {
  this.socket = sock;

  // console.log('new terminal');

  this.term = pty.fork(process.env.SHELL || 'sh', [], {
    name: require('fs').existsSync('/usr/share/terminfo/x/xterm-256color')
      ? 'xterm-256color'
      : 'xterm',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME
  });

  this.id = terms.push(this.term);
  this.id--;  // Decrement because push() return length, when we want an index

  this.term.on('data', (data) => {
    console.log('server socket emitting:');
    console.log(this.id);
    console.log(data);
    this.socket.emit('data', this.id, data);
  });

  this.socket.on('data', (id, data) => {
    console.log('server socket got data:');
    console.log(id);
    console.log(data);
    terms[id].write(data);
  });

  this.term.on('close', () => {
    // console.log('closing terminal');
    this.socket.emit('kill');
    this.term.destroy();
    this.socket = null;
  });

  this.socket.on('kill', () => {
    // console.log('this.socket disconnected');
    this.socket = null;
  });

  return callback(null, {
    id: this.id,
    pty: this.term.pty
  });
}
