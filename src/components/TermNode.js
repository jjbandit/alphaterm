import React from 'react';
import termjs from 'term.js';

import CommandActions from 'lib/actions/CommandActions';

export default class TermNode extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let socket = io.connect();

    console.log('termnode mounted');

    socket.on('connect', () => {

      console.log('client socket connected');

      window.term =  termjs.Terminal({
        cols: 80,
        rows: 24,
        cursorBlink: false
      });

      term.on('data', (data) => {
        socket.emit('data', data);
      });

      term.on('title', (title) => {
        document.title = title;
      });

      term.on('open', () => {
        console.log('term open');

        socket.emit('data', this.props.command.root + '\n');
      });

      // Create the terminal frontend
      term.open(document.getElementById(this.props.command.id));



      socket.on('data', (data) => {
        term.write(data);
      });

      socket.on('kill', () => {
        term.destroy();
        socket.emit('kill');
        socket = null;

        CommandActions.destroy(this.props.command.id);
      });

    });
  }


  // We must return a valid react component here, even if it's empty
  render() {
    return(
      <div id={this.props.command.id}><span>term!</span></div>
    )
  }
}
