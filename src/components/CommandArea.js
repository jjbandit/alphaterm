import React from 'react';
import CommandLine from "../components/CommandLine";

export default class CommandArea extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      cwdContents: []
    };
  }

  render () {
    return(
      <div id='command-area'>
        <p>{this.state.cwdContents}</p>
        <CommandLine />
      </div>
    );
  }

}
