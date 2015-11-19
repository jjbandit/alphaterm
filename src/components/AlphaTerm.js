import React from 'react';
import ReactDOM from 'react-dom';

import CommandStore from 'lib/stores/CommandStore';
import CommandArea from 'lib/components/CommandArea';
import CommandNode from 'lib/components/CommandNode';

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
      <div>
        <div id="output">
          {
            this.state.commandList.map( (command, i) => {
              return <CommandNode key={i} command={command} />;
            })
          }
        </div>
        <CommandArea />
      </div>
    )
  }
}
