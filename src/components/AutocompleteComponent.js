import React from 'react';
import fs from 'fs';
import walk from 'walk';
import Promise from 'bluebird';
import executable from 'executable';

/*
 *  This class is the top level Autocomplete component.
 */
export default class Autocomplete extends React.Component {

  constructor(props) {
    super(props);

    this.setPathTokens();

    this.state = {
      pathTokens: [],
      dirTokens: [],
      matches: []
    }
  }

  // We update matches whenever the command token gets updated
  componentWillReceiveProps(props) {
    this.setDirTokens(props.cwd);
  }

  /*
   * Returns a list of autocomplete objects from state.pathTokens
   * that gets filtered on token
   *
   * @param {string} token - Filter state.pathTokens on this arg.
   * @return {array} - The filtered tokens.
   */
  getPathMatches(token) {
  }

  /*
   * Returns a list of autocomplete objects from state.dirTokens
   * that gets filtered on token
   *
   * @param {string} token - Filter state.dirTokens on this arg.
   * @return {array} - The filtered tokens.
   */
  getDirMatches(token) {
  }

  /*
   * Sets the state.dirTokens to an array with indicies
   * for each file in dir
   *
   * @param {string} dir - Directory to index
   */
  setDirTokens(dir) {
    fs.readdir(dir, (err, dirTokens) => {
      this.setState({ dirTokens });
    });
  }

  /*
   * Sets the state.pathTokens to an array with indicies
   * for each executable file in $PATH
   *
   * Leverages the `walk` module to recursively retrieve
   * filepaths to files contained in $PATH directories
   *
   * Leverages the 'executable' module to check if each
   * file is executable, and if so adds it to the index
   * of files to return
   */
  setPathTokens() {
    const path = process.env.PATH.split(':');
    const pathLength = path.length; // Number of entries in $PATH

    let pathTokens = [];  // Array of tokens to eventually set in this.state
    let completed = 0;  // Keep track of how many walkers have ended

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
          this.setState({pathTokens});
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
