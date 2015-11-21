import React from 'react';
import ReactDOM from 'react-dom';

import {HotKeys} from 'react-hotkeys';

import CommandStore from 'lib/stores/CommandStore';
import CommandArea from 'lib/components/CommandArea';
import CommandNode from 'lib/components/CommandNode';

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
        'clear_field': (evt) => { evt.target.value = '' ; },
        'tab': (evt) => { evt.preventDefault(); }
    }

    this.KEYMAP = {
      'clear_field': ['ctrl+u']
    }

  }

  componentDidMount () {
    this.updateCommandList();
    CommandStore.addChangeListener(this.updateCommandList.bind(this));
  }

  updateCommandList() {
    CommandStore.getAll().then( (commands) => {
      this.setState({
        commandList: commands
      });
    });
  }


  render () {
    return (
      <HotKeys keyMap={this.KEYMAP} handlers={this.HANDLERS}>
        <div id="output">
          {
            this.state.commandList.map( (command, i) => {
              return <CommandNode key={i} command={command} />;
            })
          }
        </div>
        <CommandArea />
      </HotKeys>
    )
  }
}
