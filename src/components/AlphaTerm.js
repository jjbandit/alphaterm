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

    CommandStore.addChangeListener(this._onChange.bind(this));
  }

  _onChange () {
    console.log('change');

    CommandStore.getAll().then( (commands) => {
      this.setState({
        allCommands: commands
      });
    });
  }

  onClick () {
    CommandStore.create("think", ['things', 'foo', 'bar']);
  }

  render () {
    console.log('render');
    console.log(this.state);
    return (
      <div onClick={this.onClick.bind(this)}>
        {
          this.state.allCommands.map( (stuff) => {
            console.log(stuff);
            return stuff.root;
          })
        }
        <CommandArea />
      </div>
    )
  }
}
