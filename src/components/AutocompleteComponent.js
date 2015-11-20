import React from 'react';
import fs from 'fs';

export default class Autocomplete extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      matches: []
    }
  }

  // Add a change listener and update cwd paths when
  // app cwd changes
  componentDidMount() {
  }

  componentWillReceiveProps (props) {
    // console.log('recieved props');
    // console.log(props);
    this.getMatches(props.frag);
  }

  getMatches(frag) {
  }


  render() {
    return(
      <div>
        <ul>
        {
          this.state.matches.map( (match) => {
            return( <li> match </li> )
          })
        }
        </ul>
      </div>
    )
  }
}
