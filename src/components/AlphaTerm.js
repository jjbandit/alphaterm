import React from 'react';
import ReactDOM from 'react-dom';

import {HotKeys} from 'react-hotkeys';

import Terminal from 'term.js';

import Command from 'lib/classes/Command';
import CommandActions from 'lib/actions/CommandActions';
import CommandStore from 'lib/stores/CommandStore';
import CommandArea from 'lib/components/CommandArea';
import CommandNode from 'lib/components/CommandNode';
import TermNode from 'lib/components/TermNode';

/**
 * This is the main Flux "Controller-View" and the primary entry point for
 * data into the application.
 */
export default class AlphaTerm extends React.Component {
  HANDLERS; KEYMAP;

  constructor (props) {
    super(props);

    this.state = {
      commandList: [],
      terms: []
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

    this.state.socket = io.connect();

    this.state.socket.on('data', (id, data) => {
      this.state.terms[id].write(data);
    });

    this.state.socket.on('kill', () => {
      this.state.terms[this.id].destroy();
      this.state.socket.emit('kill');
      this.state.socket = null;

      // CommandActions.destroy(this.state.command.id);
    });

    this.state.socket.on('connect', () => {

    });

    // Terminal.prototype.handler = function(data) {
    //   console.log('handling');
    //   this.state.socket.emit('data', 0, data);
    // }

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
                return <TermNode key={i} socket={this.state.socket} terms={this.state.terms} command={command} />
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
