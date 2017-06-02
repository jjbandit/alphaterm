import React from 'react';

export default class CommandNode extends React.Component {


  render () {
    return (
      <div className="command-node">
        {this.props.command.data}
      </div>
    )
  }
}
