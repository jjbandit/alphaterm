$(document).on('ready', function () {
	var remote = require('remote');

	$('input#command').focus();

	$('form').on('submit', function (evt) {
		evt.preventDefault();

		var command = $('input#command').val().split(" ");

		var rootCommand = command[0];
		var args = command.slice(1);

		runCmd(rootCommand, args, setOutput);

	});

});

function setOutput (output) {
	console.log(output);
	output = '<div>' + output + '</div>';
	output = $.parseHTML(output);
	$('#output').append(output);
}

function runCmd (cmd, args, callback) {
	var spawn = require('child_process').spawn;
	var child = spawn(cmd, args);
	var resp = [];

	child.stdout.on('data', function (buffer) {
		console.log(buffer);
		resp.push(buffer.toString());
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
