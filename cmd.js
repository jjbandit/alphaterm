function runCmd (cmd, args, opts) {

	/*
	 * Initialize the html our command will be appending to
	 */

	// I picked 1,000,000 as an arbitrairily-large-enough-sounding number to avoid possible collisions
	// with processes spawned at the same time.. even though I'm reasonably sure without the multiplier
	// a collision would never happen
	var id = 'id_' + ( Date.now() * Math.floor((Math.random() * 1000000)) ) ;
	var command = "<div class='node-command'>" + cmd + " " + args.toString().replace(",", " ") + "</div>";
	var outputNode = "<div class='out-node'></div>";

	var html = '<div class="node-command-wrapper" id="' + id + '">' + command + outputNode + ' </div>';

	// Append the initial command html to the DOM
	appendToDOM(html);

	// The jquery context we will append the commands stdout to
	var context = $('#' + id );

	/*
	 * Spawn the command process
	 */
	var path = require('path');
	var spawn = require('child_process').spawn;
	var child = spawn(cmd, args, opts);

	child.stdout.on('data', function (buffer) {
		var resp = [];
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

		// Build html nodes from the response array
		buildOutput(resp, context);
	});

	child.stderr.on('data', function (buffer) {
		resp.push(buffer.toString());
	});

	child.on('close', function (code) {
		// TODO Update GUI to reflect the commands exit status.. or something to let the
		// user know how things went
	});
}

/*
 * Build html nodes from stdout of an arbitrary shell command
 *
 * TODO The node should be processed to register any event handlers (links?!)
 * prior to being added to the DOM
 */
function buildOutput (output, context) {
	var outputNode = '';

	for (var i = 0; i < output.length; i++) {
		outputNode = outputNode + '<a href="#">' + output[i] + '</a>' ;
	}
	appendToDOM(outputNode, context);
}

// This function appends a node to the #output field in the DOM and scrolls to bottom
function appendToDOM(outputNode, context) {
	// If we didn't pass in a command context append directly to #output

	if (context === undefined) {
		context = $('#output');
		context.append(outputNode);
	} else {
		contextInner = $('.out-node', context);
		contextInner.append(outputNode);
		context.scrollTop(contextInner.height());
	}
}
