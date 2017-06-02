require('crash-reporter').start();

var term            = require('xterm'),
    pty             = require('node-pty'),
    express         = require('express'),
    app             = express(),
    jade            = require('jade'),
    server          = require('http').Server(app),
    io              = require('socket.io')(server);

// Electron-specific
var electron        = require('app'),
    BrowserWindow   = require('browser-window');



app.engine('jade', require('jade').__express);
app.set('views', __dirname + "/views");
app.set('view engine', 'jade');

// app.use(term.middleware());
app.use(express.static('src/style'));

app.use(express.static('node_modules/xterm/dist/'));

app.use(express.static('lib/'));
app.use(express.static('src/script/'));



/*
 *  Routing
 */
app.get('/', function(req, res){
  res.render('index');
});

app.get('/term', function(req, res){
  res.render('term');
});




var socket,
    buff = [];




io.on('connection', function(sock) {

  socket = sock;

  var Pty = pty.fork('bash.exe', [], {
    name: require('fs').existsSync('/usr/share/terminfo/x/xterm-256color')
      ? 'xterm-256color'
      : 'xterm',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME
  });

  Pty.on('data', function(data) {
      socket.emit('data', data);
  });

  socket.on('data', function(data) {
    // console.log(JSON.stringify(data));
    Pty.write(data);
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

electron.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    electron.quit();
  }
});

electron.commandLine.appendSwitch('force-device-scale-factor', '1.5');
