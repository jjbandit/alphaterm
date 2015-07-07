var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
	var $ = require(__dirname + '/jquery-1.11.3.js');

  // Open the devtools.
  mainWindow.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});

function run_cmd (cmd, args, callback) {
	var spawn = require('child_process').spawn;
	var child = spawn(cmd, args);
	var resp = '';

	child.stdout.on('data', function (buffer) {
		resp += buffer.toString()
	});

	child.stderr.on('data', function (buffer) {
		resp += buffer.toString()
	});

	child.stdout.on('end', function() {
		if (typeof callback === 'function') {
			callback (resp)
		}
	});

	child.on('close', function (code) {
		console.log('Process ' + cmd + " " + args + ' exited with ' + code);
		console.log(resp);

		child.end();
	});
}
