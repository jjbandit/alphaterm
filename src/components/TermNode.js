import React from 'react';

import Terminal from 'term.js';

import CommandActions from 'lib/actions/CommandActions';

export default class TermNode extends React.Component {

  constructor(props) {
    super(props);

    this.state={};
  }

  componentDidMount() {

    var socket = this.props.socket;

    this.props.socket.emit('create-term', (err, data) => {
      let term = new Terminal({
        cols: 80,
        rows: 24,
        cursorBlink: false,
        handler: (data) => {
          console.log('emitting from client');
          socket.emit('data', this.id, data);
        }
      });

      this.id = data.id;
      this.props.terms[this.id] = term;

      // term.on('title', (title) => {
      //   document.title = title;
      // });


//       term.on('data', (data) => {

//         console.log("emitting from client: ");
//         console.log(this.id);
//         console.log(data);

//         this.props.socket.emit('data', this.id, data);
//       });

      // Create the terminal frontend
      let src = document.getElementById(this.props.command.id);
      term.open(src);

    });
  }


  render() {
    console.log('render');
    return(
      <div id={this.props.command.id}><span>term!</span></div>
    )
  }
}

