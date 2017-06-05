import React from 'react';

import Builtin from '../classes/Builtin';

import Command from '../classes/Command';
import CommandConstants from '../constants/CommandConstants';
import CommandActions from '../actions/CommandActions';

import ViewConstants from '../constants/ViewConstants';

import AutoCompleteField from '../components/AutoCompleteFieldComponent';

import AliasProvider from '../completionProviders/Alias.js';

import XtermCommands from '../Config/defaults'
import InterfaceActions from '../actions/InterfaceActions';

/*
 *  This class is intended as a base class for constructing components used
 *  for running commands.
 */
export default class CommandLine extends React.Component {

  constructor (props) {
    super(props);

    this.builtins = new Builtin();

    this.HANDLERS = {};

    this.state = {}
  }

  componentDidMount () {
    this.setCwd(process.env.HOME);
    this.builtins.registerHandler({ builtin: 'cd', handler: this.setCwd, context: this });
  }

  /*
   *  Sets the components state.cwd based on a relative or absolute
   *  input path.  If no path is passed in, the state will be set to
   *  a default value.
   */
  setCwd(cwd) {
    this.setState({cwd});
  }

  /*
   * Insert a Command object into CommandStore or flip to Xterm view
   */
  createCommand(evt) {
    evt.preventDefault();

    let commandTokens = this.refs.AutoCompleteField.state.commandTokens;

    let rawCommand = commandTokens.join(' ');

    let Cmd;

    if (  AliasProvider.aliasTokens.indexOf( commandTokens[0]) !== -1 ) {
      Cmd = AliasProvider.getCommand( commandTokens[0] );
      Cmd.dir = this.state.cwd;

    } else {
      Cmd = new Command( rawCommand, this.state.cwd );
    }

    if ( XtermCommands[Cmd.root] ) {
      InterfaceActions.Redirect(ViewConstants.Xterm);
    }

    if ( ! this.builtins.run( Cmd ) ) {
      CommandActions.create(Cmd);
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
