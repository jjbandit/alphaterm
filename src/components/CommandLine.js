import React from 'react';

import Command from 'lib/classes/Command';
import CommandConstants from 'lib/constants/CommandConstants';
import CommandActions from 'lib/actions/CommandActions';

import AutoCompleteField from 'lib/components/AutoCompleteFieldComponent';

export default class CommandLine extends React.Component {

  HANDLERS;

  constructor (props) {
    super(props);
    this.state = {}

  }

  componentDidMount () {
    this.setCwd('/home/scallywag');
  }

  /*
   *  Sets the components state.cwd based on a relative or absolute
   *  input path.  If no path is passed in, the state will be set to
   *  a default value.
   */
  setCwd(dir) {
    let _cwd = '',
        path = require('path');

    // If we pass in an absolute path set cwd to it, otherwise
    // resolve the cwd based on the relative path.
    if (dir) {
       path.isAbsolute(dir) ?
        _cwd = dir :
        _cwd = path.join(this.state.cwd, dir);
    }

    this.setState({
      cwd: _cwd
    });
  }

  /*
   *  TODO: Port this functionality to its own Builtin class.
   */
  intercept(cmd) {
    if (cmd.root === 'cd') {
      this.setCwd(cmd.args[0]);
      return true;
    }

    return false;
  }

  /*
   * Insert a Command object into CommandStore.
   */
  createCommand(evt) {
    evt.preventDefault();

    let rawCommand = this.refs.AutoCompleteField.state.commandTokens.join(' ');

    let commandObject = new Command( rawCommand, this.state.cwd );

    if ( ! this.intercept(commandObject) ) {
      CommandActions.create(commandObject);
    }

    this.refs.AutoCompleteField.reset();
  }

  render () {
    return (
      <div id='command-line'>
        <p>{this.state.cwd}</p>

        <form onSubmit={this.createCommand.bind(this)}>
          <AutoCompleteField ref="AutoCompleteField" cwd={this.state.cwd} />
        </form>

      </div>
    );
  }
}
