$( document ).ready( function () {
	$('input#command').focus();
	setCwd();
});

$( window ).load( function () {
	$('input#command').focus();

	$('form').on('submit', function (evt) {
		evt.preventDefault();
		var commandField = $('input#command');

		var command = commandField.val().split(" ");

		var rootCommand = command[0];
		var args = command.slice(1);

		var opts = {
			cwd: _cwd
		}

		// Intercept executes alphaterm specific implementations of
		// shell commands such as cd
		if ( intercept(rootCommand, args, opts, buildOutput) ) {
			commandField.val('');
			return;
		}

		runCmd(rootCommand, args, opts, buildOutput);

		commandField.val('');

	});

});

function setCwd(dir) {
	if (dir) {
		_cwd = dir;
	} else {
		_cwd = '/home/scallywag';
	}
}
