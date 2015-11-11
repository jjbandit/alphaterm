let ReactDOM = require('react-dom');

class CommandLine extends AlphaComponent {

  _cwd;

  constructor (props) {
    super(props);

    ReactDOM.render(<CommandLineComponent />, document.getElementById('CommandLine'));

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
    let path = require('path');

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
    typeof(opts) === 'function' ? ( callback = opts, opts = {} ) : null ;

    opts = opts ? opts : {} ;

    opts.cwd = this._cwd;

    // If we didn't supply a callback to handle the command output
    // then initialize some html for the command
    let context = callback ? null : this.initializeCmdHtml(cmd, args) ;

    /*
    * Spawn the command process
    */
    let path = require('path');
    let spawn = require('child_process').spawn;
    let child = spawn(cmd, args, opts);

    child.stdout.on('data', (buffer) => {
      let resp = [];
      // This splits the buffer into an array (resp[]) with indexes for each
      // newline (utf8 character code 10) character in the buffer
      let lastEOL = 0;
      for (let i = 0; i < buffer.length; i++) {

        if (buffer[i] === 10) {
          let val = buffer.slice(lastEOL, i).toString();
          resp.push(val);
          // adding 1 to i makes sure the newline char doesn't
          // make it into the output
          lastEOL = i + 1;
        }
      }

      // Otherwise build html nodes from the response array and append
      // to the DOM
      let html = this.buildOutput(resp).then( (html) => {

      // If we passed in a callback then send the output there
      if (callback){
        callback(html, context);

      } else {
        this.appendToDOM(html, context);
      }

        // Register click handler for links.
        //
        // TODO This should be done in an after-hook where any number of
        // arbitrary callbacks can be called upon appending data to the DOM.
        $('a').on( 'click', (evt) => {
          evt.preventDefault();
          this.setCwd(evt.target.pathname);
        });


      }).catch( (err) => {
        console.error('err', err);
      });

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
  buildOutput (output, context, tag = 'div') {
    let outputNode = '';

    return new Promise ( (fulfill, reject) => {

      this.processLinks(output).then( (output) => {

        for (let i = 0; i < output.length; i++) {
          outputNode = outputNode + '<' + tag + '>' + output[i] + '</' + tag + '>' ;
        }

        fulfill(outputNode);

      }).catch( (err) => {

        console.error('err', err.stack);

      });

    });

  }

  processLinks (output, context) {
    let Promise = require('bluebird');
    let fs = require('fs');
    let path = require('path');

    let fsAccess = Promise.promisify(fs.access, fs);

    return new Promise( (fulfill, reject) => {

      for ( let i=0; i < output.length; i++ ) {
        let filePath = this._cwd + path.sep + output[i];

        fsAccess(filePath, fs.F_OK).then( (thing) => {
          output[i] = '<a href="' + filePath + '">' + output[i] + "</a>";

          if ( i === output.length - 1 ) {
            fulfill(output);
          }

        }).error( (e) => {
          // Debug errors with fsAccess here
          // console.log('error', e);
          }
        );

      }

    });
  }

  /*
    This function retuns a jquery context useful for appending data to
    asynchronously, or whatever else your little heart desires.
    */
  initializeCmdHtml(cmd, args) {

    // Make a super-duper unique id
    let id = 'id_' + ( Date.now() * Math.floor((Math.random() * 1000000)) ) ;
    let command = "<div class='node-command'>" + cmd + " " + args.toString().replace(",", " ") + "</div>";
    let outputNode = "<div class='out-node'></div>";

    let html = '<div>' + command + '<div class="node-command-wrapper" id="' + id + '">' + outputNode + ' </div></div>';

    // Append the initial command html to the DOM
    this.appendToDOM(html);

    // The jquery context we will append the commands stdout to
    let context = $('#' + id );

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
