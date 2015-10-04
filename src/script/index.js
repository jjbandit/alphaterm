window.$ = window.jQuery = require('jquery');

$(document).ready( function () {

  var c = new CommandArea();

  $('form').on('submit', function (evt) {

    evt.preventDefault();
    var commandField = $('input#command');

    var command = commandField.val().split(" ");

    var rootCommand = command[0];
    var args = command.slice(1);

    var opts = {
      cwd: this._cwd
    }

    // Intercept executes alphaterm specific implementations of
    // shell commands such as cd
    if ( c.intercept(rootCommand, args, opts) ) {
      commandField.val('');
      return;
    }

    c.runCmd(rootCommand, args, opts);

    commandField.val('');

  });


});
