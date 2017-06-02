import React from 'react';

export default class lsFormatter extends React.Component {


  render () {
    return (
      <div className="command-node-data">
        {
          this.props.command.data.map( (data, i) => {
            return <span key={i}> {data} </span> ;
          })
        }
      </div>
    )
  }
}
