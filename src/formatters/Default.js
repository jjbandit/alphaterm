import React from 'react';

export default class CommandNode extends React.Component {


  render () {
    let Data = this.props.command.data.map( (data, i) => {
                  return <span key={i} className="default-format"> {data} </span>
                })
    return (
      <div className="command-node"> {Data} </div>
    )
  }
}
