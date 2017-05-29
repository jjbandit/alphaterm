import React from 'react';

import Builtin from '../classes/Builtin';

import Command from '../classes/Command';
import CommandConstants from '../constants/CommandConstants';
import CommandActions from '../actions/CommandActions';

import AutoCompleteField from '../components/AutoCompleteFieldComponent';

import AliasProvider from '../completionProviders/Alias.js';

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
   * Insert a Command object into CommandStore.
   */
  createCommand(evt) {
    evt.preventDefault();

    let commandTokens = this.refs.AutoCompleteField.state.commandTokens;

    let rawCommand = commandTokens.join(' ');

    let commandObject;

    if (  AliasProvider.aliasTokens.indexOf( commandTokens[0]) !== -1 ) {
      commandObject = AliasProvider.getCommand( commandTokens[0] );
      commandObject.dir = this.state.cwd;

    } else {
      commandObject = new Command( rawCommand, this.state.cwd );
    }

    if ( ! this.builtins.run( commandObject ) ) {
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
