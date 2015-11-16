import React from 'react';
import ReactDOM from 'react-dom';
import CommandStore from 'lib/stores/CommandStore';

/*
 * This is the main Flux "Controller-View" and the primary entry point for
 * data into the application.
 */
class AlphaTerm extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      allCommands: []
    }
  }

  componentDidMount () {

    CommandStore.getAll().then( (commands) => {

      this.setState({
        allCommands: commands
      });
    });

    CommandStore.addChangeListener(this._onChange.bind(this));
  }

  _onChange () {
    CommandStore.getAll().then( (commands) => {
      this.setState({
        allCommands: commands
      });
    });
  }


  render () {
    return (
      <div>
        <CommandArea />
        <div id="output">
          {
            this.state.allCommands.map( (command, i) => {
              return ( <CommandNode key={i} command={command} /> )
            })
          }
        </div>
      </div>
    )
  }
}
