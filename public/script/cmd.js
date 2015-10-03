/*



	*/
function runCmd (cmd, args, opts, callback) {
	/*
	* If we pass in a callback, skip all the default handling and pass the
	* stdout data to the callback, otherwise use the default behavor and output
	* to the #output div in DOM.
	*/

	typeof(args) === 'function' ? ( callback = args, args = [] ) : null ;
	typeof(opts) === 'function' ? ( callback = opts, opts = [] ) : null ;

	// If we didn't supply a callback to handle the command output
	// then initialize some html for the command
	var context = callback ? null : initializeCmdHtml(cmd, args) ;

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

		// If we passed in a callback then send the output there
		if (callback){
			callback(resp, context);

		// Otherwise build html nodes from the response array and append
		// to the DOM
		} else {
			var html = buildOutput(resp);
			appendToDOM(html, context);
		}
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
function buildOutput (output, context, tag) {
	tag ? null : tag = 'div' ;
	var outputNode = '';

	for (var i = 0; i < output.length; i++) {
		outputNode = outputNode + '<' + tag + '>' + output[i] + '</' + tag + '>' ;
	}

	return outputNode;
}

// This function appends a node to the #output field in the DOM and scrolls to bottom
function appendToDOM(outputNode, context) {

	// If we didn't pass in a command context append directly to #output
	if (context === undefined) {
		context = $('#output');
		context.append(outputNode);

	// Otherwise append the output to the supplied contextual area
	} else {
		contextInner = $('.out-node', context);
		contextInner.append(outputNode);
		context.scrollTop(contextInner.height());
	}
}

/*
	This function retuns a jquery context useful for appending data to
	asynchronously, or whatever else your little heart desires.
	*/
function initializeCmdHtml(cmd, args) {

	// Make a super-duper unique id
	var id = 'id_' + ( Date.now() * Math.floor((Math.random() * 1000000)) ) ;
	var command = "<div class='node-command'>" + cmd + " " + args.toString().replace(",", " ") + "</div>";
	var outputNode = "<div class='out-node'></div>";

	var html = '<div>' + command + '<div class="node-command-wrapper" id="' + id + '">' + outputNode + ' </div></div>';

	// Append the initial command html to the DOM
	appendToDOM(html);

	// The jquery context we will append the commands stdout to
	var context = $('#' + id );

	return context;
}

