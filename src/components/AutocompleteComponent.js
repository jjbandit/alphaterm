import React from 'react';
import ReactDOM from 'react-dom';
import fs from 'fs';
import walk from 'walk';
import Promise from 'bluebird';
import executable from 'executable';
import * as Fuzz from 'fuzzaldrin';

/*
 *  This class is the top level Autocomplete component.
 *
 *  TODO: Currently the completion list appears broken when state.*tokens
 *  have not completed population.. provide some visual feedback for
 *  loading state.
 *
 */
export default class Autocomplete extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pathTokens: [],
      dirTokens: [],
      completions: []
    }
  }

  // Initialize $PATH tokenization ASAP.
  //
  // TODO: This takes a long time and should
  // have some visual cues for started/ended
  componentDidMount() {
    this.getPathTokens().then( (pathTokens) => {
      this.setState({pathTokens});
    });
  }

  /*
   *  This is where we update completion tokens and dirTokens
   *  according to new props we're receiving
   */
  componentWillReceiveProps(props) {

    // If we've changed directory then update dirTokens
    if (props.cwd !== this.props.cwd) {
      this.getDirTokens(props.cwd).then( (dirTokens) => {
        this.setState({dirTokens});
      });
    }

    // If the token has changed update the completions
    if (props.token !== this.props.token) {
      let completions = this.getCompletions(props.token);
      this.setState({completions});
    }
  }

  /*
   * Returns a list of autocomplete objects from state.*Tokens
   * that gets filtered on token
   *
   * @param {string} token - Filter state tokens on this arg.
   * @return {array} - The sorted, filtered tokens.
   */
  getCompletions(token) {
    let completions = [];

    // Return no completions if token is empty
    if ( token === '' ) { return completions }

    const candidates = this.state.pathTokens.concat(this.state.dirTokens);
    completions = Fuzz.filter(candidates, token, { maxResults: 10 });

    return completions;
  }

  /*
   * Sets the state.dirTokens to an array with indicies
   * for each file in dir
   *
   * @param {string} dir - Directory to index
   */
  getDirTokens(dir) {
    return new Promise( (fulfill, reject) => {

      fs.readdir(dir, (err, dirTokens) => {
        if (err) {
          reject(err);
        } else {
          fulfill(dirTokens);
        }
      });
    });
  }

  /*
   * Leverages the `walk` module to recursively retrieve
   * filepaths to files contained in $PATH directories
   *
   * Leverages the 'executable' module to check if each
   * file is executable, and if so adds it to the index
   * of files to return
   *
   * @return {Promise} - Fulfills with an array containing indicies
   * for each executable file in $PATH
   */
  getPathTokens() {
    const path = process.env.PATH.split(':');
    const pathLength = path.length; // Number of entries in $PATH

    let pathTokens = [];  // Array of tokens to eventually set in this.state
    let completed = 0;  // Keep track of how many walkers have ended

    return new Promise( (fulfill, reject) => {

      // Create a walk instance for each directory in $PATH
      path.map( (dir, i) => {
        let walker = walk.walk(dir);

        // When we encounter a file:
        // 1) check if it is executable
        // 2) push it into pathTokens[] if it is.
        walker.on('file', (root, fileStat, next) => {
          const filePath = `${root}/${fileStat.name}` ;

          // executable returns a falsy value in exec
          executable(filePath).then( exec => {
            if (exec) {
              pathTokens.push(fileStat.name);
            }
          });

          // Continue to next file
          next();
        });

        // Cache how many walkers have hit this event, and if all have ended then
        // update the components state
        walker.on('end', () => {
          if ( ++completed === pathLength ) {
            fulfill(pathTokens);
          }
        });

        // Spit out errors to console.error
        walker.on('errors', (root, errors, next) => {
          errors.map( e => {
            console.error(e.error);
          });
          next();
        });

      });  // End path.map loop
    });  // End Promise
  }

  render() {
    return(
      <div>
        {
          this.state.completions.map( (comp, i) => {
            return( <span key={i} className={ this.props.selected === i ? "selected" : null } >{comp}</span> )
          })
        }
      </div>
    )
  }
}
