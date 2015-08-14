function runCmd (cmd, args, opts, callback) {
	var path = require('path');
	var spawn = require('child_process').spawn;
	var child = spawn(cmd, args, opts);
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
			callback(resp, cmd, args);
		}

		return resp;
	});
}

// This function builds and returns an output node suitable for addition to the DOM.
// The node should then be preprocessed to register any event handlers (links?)
// and appended to the DOM by showOutput
function buildOutput (output, cmd, args) {
	var command = cmd + " " + args.toString().replace(",", " ");
	var outputNode = '';

	for (var i = 0; i < output.length; i++) {
		outputNode = outputNode + '<a href="#" class="thing">' + output[i] + '</a>' ;
	}
	outputNode = "<div class='node-command'>" + cmd + "</div>" + outputNode;
	outputNode = "<div class='out-node'>" + outputNode + '</div>';

	showOutput(outputNode);
}

// This function appends a node to the #output field in the DOM and scrolls to bottom
function showOutput(outputNode) {
	var outputField = $('#output');
	outputField.append(outputNode);
	$('body').scrollTop( $(document).height() );
}

function intercept (cmd, args, opts, callback) {
	if (cmd === 'cd') {
		setCwd(args[0]);
		return true;
	}
	return false;
}
