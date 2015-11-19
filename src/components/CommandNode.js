import React from 'react';

import CommandActions from 'lib/actions/CommandActions';

export default class CommandNode extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if ( ! this.props.command.data ) {
      this.runCmd(this.props.command);
    }
  }

  killCommand() {
    CommandActions.destroy(this.props.command.id);
  }

  render () {
    return (
      <div className="command-node">
        <p className="command-node-info">
          <button onClick={this.killCommand.bind(this)}>X</button>
          <span className="command-node-status">{this.props.command.exit}</span>
          {this.props.command.root}
          {this.props.command.args}
          {this.props.command.dir}
        </p>
        <p className="command-node-data">
          {this.props.command.data}
        </p>
      </div>
    )
  }

  runCmd (cmd, opts, callback) {
    /*
    * If we pass in a callback, skip all the default handling and pass the
    * stdout data to the callback, otherwise use the default behavor and
    * update the command data attribute.
    */

    typeof(args) === 'function' ? ( callback = args, args = [] ) : null ;
    typeof(opts) === 'function' ? ( callback = opts, opts = {} ) : null ;

    opts = opts ? opts : {} ;

    opts.cwd = cmd.dir;

    /*
    * Spawn the command process
    */
    let path = require('path');
    let spawn = require('child_process').spawn;
    let child = spawn(cmd.root, cmd.args, opts);

    child.stdout.on('data', (buffer) => {
      let resp = [];
      let lastEOL = 0;

      // This splits the buffer into an array, resp[], with indicies for each
      // newline character in the buffer
      for (let i = 0; i < buffer.length; i++) {

        if (buffer[i] === 10) {
          let val = buffer.slice(lastEOL, i).toString();
          resp.push(val);
          // adding 1 to i makes sure the newline char doesn't
          // make it into the output
          lastEOL = i + 1;
        }
      }

      if (callback){
        callback(resp, context);

      } else {
        this.updateCommandData(resp);
      }
    });

    child.on('close', (code) => {
      let _status;
      let _cmd = this.props.command;

      if (code !== 0) {
        _status = `Error: Exit ${code}`
      } else {
        _status = '\u{2713}'
      }

      _cmd.exit = _status ;

      CommandActions.update(_cmd);
    });

    child.on('error', (err) => {
      this.updateCommandData([err.stack]);
    });
  }

  updateCommandData (newData) {
    // Wrap data in an array for consistency
    let _cmd = this.props.command;
    let _cmdData = _cmd.data;

    _cmd.data = _cmd.data ? _cmd.data : [] ;

    newData.map( (data) => {
      _cmd.data.push(data);
    })

    CommandActions.update(_cmd);
  }
}
