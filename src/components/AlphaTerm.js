import React from 'react';
import ReactDOM from 'react-dom';

import {HotKeys} from 'react-hotkeys';

import Command from '../classes/Command';
import CommandActions from '../actions/CommandActions';
import CommandStore from '../stores/CommandStore';
import CommandArea from '../components/CommandArea';
import CommandNode from '../components/CommandNode';

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
    }

    this.KEYMAP = {};
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
