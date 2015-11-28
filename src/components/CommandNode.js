import React from 'react';

import Command from 'lib/classes/Command';
import CommandActions from 'lib/actions/CommandActions';

export default class CommandNode extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if ( ! this.props.command.data ) {
      this.props.command.spawn();
    }
  }

  killCommand() {
    CommandActions.destroy(this.props.command.id);
  }

  render () {
    return (
      <div className="command-node">
        <p className="command-node-info">
          <button onClick={this.killCommand.bind(this)}>X</button>
          <span className="command-node-status">{this.props.command.exit}</span>
          {this.props.command.root}
          {this.props.command.args}
          {this.props.command.dir}
        </p>
        <p className="command-node-data">
          {this.props.command.data}
        </p>
      </div>
    )
  }

}
