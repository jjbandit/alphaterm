import React from 'react';

import Command from '../classes/Command';
import CommandActions from '../actions/CommandActions';

import lsFormatter from '../formatters/ls';
import DefaultFormatter from '../formatters/Default';

export default class CommandNode extends React.Component {

  constructor(props) {
    super(props);
    this._cmd = this.props.command;
  }

  componentDidMount() {

    if ( this._cmd.data.length === 0 )
    {
      let child = this._cmd.spawn();

      /*
       *  Append stdout data to the commands data property
       */
      child.stdout.on('data', (buffer) => {
        let resp = buffer.toString().split('\n');
        this._cmd.appendData(resp);
      });

      /*
       *  Set the status status of the command
       */
      child.on('close', (code) => {
        if (code === 0) {
          this._cmd.status = '\u{2713}' // Unicode checkmark

        } else {
          this._cmd.status = `Error: status ${code}`
        }

        CommandActions.update(this._cmd);
      });

      /*
       *  Log command errors
       */
      child.stderr.on('data', (data) => {
        this._cmd.appendData([data.toString()]);
      });

      /*
       *  Log command execution errors
       */
      child.on('error', (err) => {
        this._cmd.appendData(['Command not found']);
      });
    }
  }


  killCommand() {
    CommandActions.destroy(this.props.command.id);
  }

  render() {

    let Formatter;

    switch (this._cmd.root)
    {
      case 'ls': {
        Formatter = lsFormatter;
      } break;

      default: {
        Formatter = DefaultFormatter;
      } break;
    }

    return (
      <div className="command-node">
        <div className="command-node-info">
          <span onClick={this.killCommand.bind(this)} className="command-node-remove">X</span>
          <span className="command-node-status">{this.props.command.status}</span>
          <span className="command-node-status">{this.props.command.root}</span>

          {
            this.props.command.args.map( (arg, i) => {
              return <span key={i} className="command-node-status">{arg}</span>
            })
          }

          <span className="command-node-status">{this.props.command.dir}</span>
        </div>
        <Formatter command={this._cmd}></Formatter>
      </div>
    )
  }

}
