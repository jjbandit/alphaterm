import React from 'react';
import ReactDOM from 'react-dom';

import {HotKeys} from 'react-hotkeys';

import Command from 'lib/classes/Command';
import CommandActions from 'lib/actions/CommandActions';
import CommandStore from 'lib/stores/CommandStore';
import CommandArea from 'lib/components/CommandArea';
import CommandNode from 'lib/components/CommandNode';
import TermNode from 'lib/components/TermNode';

/*
 * This is the main Flux "Controller-View" and the primary entry point for
 * data into the application.
 */
export default class AlphaTerm extends React.Component {
  HANDLERS; KEYMAP;

  constructor (props) {
    super(props);

    this.state = {
      commandList: []
    }

    this.HANDLERS = {
        'ctrl+l': (evt) => {
          CommandActions.clear()
        },
    }
  }

  componentDidMount() {
    this.updateCommandList();
    CommandStore.addChangeListener(this.updateCommandList.bind(this));
  }

  updateCommandList() {
    CommandStore.getAll().then( (commandList) => {
      this.setState({ commandList });
    });
  }

  render () {
    return (
      <div>
      <HotKeys keymap={this.KEYMAP} handlers={this.HANDLERS}>

        <div id="output">
          {
            this.state.commandList.map( (command, i) => {
              if ( command.args.indexOf('--create-tty') != -1 ) {
                return <TermNode key={i} command={command} />
              } else {
                return <CommandNode key={i} command={command} />;
              }
            })
          }
        </div>
        <CommandArea />
      </HotKeys>
      </div>
    )
  }
}
