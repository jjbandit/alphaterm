import React from 'react';

import Command from '../classes/Command';
import CommandActions from '../actions/CommandActions';

export default class CommandNode extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {

    let _cmd = this.props.command;

    if ( _cmd.data.length === 0 ) {

      let child = _cmd.spawn();

      /*
       *  Append stdout data to the commands data property
       */
      child.stdout.on('data', (buffer) => {
        let resp = buffer.toString().split('\n');
        _cmd.appendData(resp);
      });

      /*
       *  Set the exit status of the command
       */
      child.on('close', (code) => {
        if (code === 0) {
          _cmd.exit = '\u{2713}' // Unicode checkmark

        } else {
          _cmd.exit = `Error: Exit ${code}`
        }

        CommandActions.update(_cmd);
      });

      /*
       *  Log command errors
       */
      child.stderr.on('data', (data) => {
        _cmd.appendData([data.toString()]);
      });

      /*
       *  Log command execution errors
       */
      child.on('error', (err) => {
        _cmd.appendData(['Command not found']);
      });
    }
  }


  killCommand() {
    CommandActions.destroy(this.props.command.id);
  }

  render () {
    return (
      <div className="command-node">
        <p className="command-node-info">
          <span onClick={this.killCommand.bind(this)} className="command-node-remove">X</span>
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

}
