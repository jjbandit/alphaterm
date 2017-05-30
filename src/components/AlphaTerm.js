import React from 'react';
import ReactDOM from 'react-dom';

import {HotKeys} from 'react-hotkeys';

import Command from '../classes/Command';
import CommandArea from '../components/CommandArea';
import CommandNode from '../components/CommandNode';

import CommandActions from '../actions/CommandActions';
import CommandStore from '../stores/CommandStore';

import InterfaceActions from '../actions/InterfaceActions';
import AppStateStore from '../stores/AppStateStore';

/*
 * This is the main Flux "Controller-View" and the primary entry point for
 * data into the application.
 */
export default class AlphaTerm extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      commandList: []
    }

    this.HANDLERS = {
        'ctrl+l': (evt) => {
          CommandActions.clear()
        },
        'escape': (evt) => {
          InterfaceActions.focusCommandLine()
        },
    }

    this.KEYMAP = {};
  }

  componentDidMount() {
    this.updateCommandList();
    CommandStore.addChangeListener(this.updateCommandList.bind(this));
    InterfaceActions.focusCommandLine();
  }

  updateCommandList() {
    CommandStore.getAll().then( (commandList) => {
      this.setState({ commandList });
    });
  }

  render () {
    return (
      <div id="alphaterm">
        <HotKeys keymap={this.KEYMAP} handlers={this.HANDLERS}>
          <div id="output">
            {
              this.state.commandList.map( (command, i) => {
                return <CommandNode key={i} command={command} />;
              })
            }
          </div>
          <CommandArea />
        </HotKeys>
      </div>
    )
  }
}
