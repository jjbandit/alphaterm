class CommandLine {

  _cwd;

  constructor () {

    $('input#command').focus();

    this.setCwd();

  }

  intercept (cmd, args, opts, callback) {
    if (cmd === 'cd') {
      this.setCwd(args[0]);
      return true;
    }
    return false;
  }

  setCwd(dir) {
    var path = require('path');
    if (dir) {
      // If we pass in an absolute path set cwd to it, otherwise
      // resolve the cwd based on the relative path.
      path.isAbsolute(dir) ? this._cwd = dir : this._cwd = path.join(this._cwd, dir);
    } else {
      this._cwd = '/home/scallywag';
    }

    $('#infobar #cwd').text(this._cwd);
  }

  runCmd (cmd, args, opts, callback) {
    /*
    * If we pass in a callback, skip all the default handling and pass the
    * stdout data to the callback, otherwise use the default behavor and output
    * to the #output div in DOM.
    */

    typeof(args) === 'function' ? ( callback = args, args = [] ) : null ;
    typeof(opts) === 'function' ? ( callback = opts, opts = [] ) : null ;

    // If we didn't supply a callback to handle the command output
    // then initialize some html for the command
    var context = callback ? null : this.initializeCmdHtml(cmd, args) ;

    /*
    * Spawn the command process
    */
    var path = require('path');
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args, opts);

    child.stdout.on('data', (buffer) => {
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
        var html = this.buildOutput(resp);
        this.appendToDOM(html, context);
      }
    });

    child.stderr.on('data', (buffer) => {
      resp.push(buffer.toString());
    });

    child.on('close', (code) => {
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
  buildOutput (output, context, tag) {
    tag ? null : tag = 'div' ;

    this.processLinks(output);

    var outputNode = '';

    for (var i = 0; i < output.length; i++) {
      outputNode = outputNode + '<' + tag + '>' + output[i] + '</' + tag + '>' ;
    }

    return outputNode;
  }

  processLinks(output, context) {
    let fs = require('fs');

    for (var out of output) {
      fs.access(out, fs.F_OK, function (err) {
        console.log(err ? 'err' : 'found');
      });;
    }
  };

  /*
    This function retuns a jquery context useful for appending data to
    asynchronously, or whatever else your little heart desires.
    */
  initializeCmdHtml(cmd, args) {

    // Make a super-duper unique id
    var id = 'id_' + ( Date.now() * Math.floor((Math.random() * 1000000)) ) ;
    var command = "<div class='node-command'>" + cmd + " " + args.toString().replace(",", " ") + "</div>";
    var outputNode = "<div class='out-node'></div>";

    var html = '<div>' + command + '<div class="node-command-wrapper" id="' + id + '">' + outputNode + ' </div></div>';

    // Append the initial command html to the DOM
    this.appendToDOM(html);

    // The jquery context we will append the commands stdout to
    var context = $('#' + id );

    return context;
  }

  // This function appends a node to the #output field in the DOM and scrolls to bottom
  appendToDOM(outputNode, context) {

    // If we didn't pass in a command context append directly to #output
    if (context === undefined) {
      context = $('#output');
      context.append(outputNode);

    // Otherwise append the output to the supplied contextual area
    } else {
      let contextInner = $('.out-node', context);
      contextInner.append(outputNode);
      context.scrollTop(contextInner.height());
    }
  }

}
