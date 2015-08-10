$(document).on('ready', function () {
	$('input#command').focus();

	$('form').on('submit', function (evt) {
		evt.preventDefault();
		var commandField = $('input#command');

		var command = commandField.val().split(" ");

		var rootCommand = command[0];
		var args = command.slice(1);

		runCmd(rootCommand, args, setOutput);

		commandField.val('');
	});

});

function setOutput (output) {
	for (var i = 0; i < output.length; i++) {
		output[i] = '<div>' + output[i] + '</div>';
	}
	output = '<div>' + output + '</div>';
	output = $.parseHTML(output);
	$('#output').append(output);
}

function runCmd (cmd, args, callback) {
	var spawn = require('child_process').spawn;
	var child = spawn(cmd, args);
	var resp = [];

	child.stdout.on('data', function (buffer) {

		// This splits the buffer into an array (resp[]) with indexes for each
		// newline (utf8 character code 10) character in the buffer
		var lastEOL = 0;
		for (var i = 0; i < buffer.length; i++) {

			if (buffer[i] === 10) {
				var val = buffer.slice(lastEOL, i).toString();
				resp.push(val);
				// adding 1 to i makes sure the newline char doesn't
				// make it into the output
				lastEOL = i + 1;
			}
		}

	});

	child.stderr.on('data', function (buffer) {
		resp.push(buffer.toString());
	});

	child.on('close', function (code) {

		if (typeof callback === 'function') {
			callback (resp)
		}

		return resp;
	});
}
