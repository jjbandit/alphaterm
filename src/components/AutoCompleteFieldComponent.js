import React from 'react';

import {HotKeys} from 'react-hotkeys';
import ReactDOM from 'react-dom';
import fs from 'fs';
import walk from 'walk';
import executable from 'executable';
import * as Fuzz from 'fuzzaldrin';
import Command from 'lib/classes/Command';

/*
 *  This class is the top level AutoCompleteField component.
 *
 *  TODO: Currently the completion list appears broken when state.*tokens
 *  have not completed population.. provide some visual feedback for
 *  loading state.
 *
 */
export default class AutoCompleteFieldComponent extends React.Component {

  constructor(props) {
    super(props);

    this.HANDLERS = {
      // Reset the command field
      'ctrl+u': (evt) => {
        this.reset();
      },
      // Increment completion selection
      'tab': (evt) => {
        evt.preventDefault();
        this.acceptSelection("INCREMENT");
      },
      // Decrement completion selection
      'shift+tab': (evt) => {
        evt.preventDefault();
        this.acceptSelection("DECREMENT");
      }
    }

    // Initialize state to default empty values
    this.state = {
      selected: -1,
      token: '',
      commandTokens: [],
      pathTokens: [],
      dirTokens: [],
      completions: []
    }
  }

  reset() {
    this.setState({ selected: -1, completions: [], commandTokens: [] });
  }

  /* Initialize $PATH tokenization ASAP.
   *
   * TODO: This takes a long time and should
   * have some visual cues for started/ended
   */
  componentDidMount() {
    this.getPathTokens().then( (pathTokens) => {
      this.setState({pathTokens});
    });
  }

  /*
   *  Increments || Decrements the state.selected property and updates
   *  the state.commandTokens array, in turn updating the command input value.
   *
   *  The function loops at boundaries of this.state.completions.
   *
   *  @param {string} operator - the direction to move the selected completion
   *  Should be one of either "INCREMENT" or "DECREMENT"
   */
  acceptSelection(operator) {
    let selected = this.state.selected;
    let numCompletions = this.state.completions.length;

    if (operator === "INCREMENT") {
      ++selected % numCompletions === 0 ? selected = 0 : null ;
    }

    if (operator === "DECREMENT") {
      --selected === -1 ? selected = numCompletions - 1 : null ;
    }

    let commandTokens = this.state.commandTokens;

    // Update last commandToken to the relevant completion item
    commandTokens[commandTokens.length - 1] = this.state.completions[selected];

    this.setState({
      selected,
      commandTokens
    });
  }

  /*
   *  This sets the widgets completion list and manages the command inputs value.
   *  It is bound to trigger when the text input field changes.
   */
  updateCommandTokens(evt) {
    let commandTokens = evt.target.value.split(' ');
    let token = commandTokens[commandTokens.length - 1];

    let completions = this.getCompletions(token);

    this.setState({
      // Set completions
      completions,
      // Set the input value
      commandTokens,
      // Reset completion selection
      selected: -1
    });
  }

  /*
   *  Update dirTokens when the parent passes in a new cwd property.
   */
  componentWillReceiveProps(props) {

    // If we've changed directory then update dirTokens
    if (props.cwd !== this.props.cwd) {
      this.getDirTokens(props.cwd).then( (dirTokens) => {
        this.setState({dirTokens});
      });
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
   *
   */
  getAliasTokens() {
    let alias = process.env.alias;
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
        // fulfill the promise
        walker.on('end', () => {
          if ( ++completed === pathLength ) {
            fulfill(pathTokens);
          }
        });

        // Spit out errors to console.error and continue business as usual
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
      <HotKeys handlers={this.HANDLERS}>
        <div id='completions-wrapper'>
        {
          this.state.completions.map( (comp, i) => {
            return( <span key={i} className={ this.state.selected === i ? "selected" : null } >{comp}</span> )
          })
        }
        </div>

          <input
            value={this.state.commandTokens.join(' ')}
            onChange={this.updateCommandTokens.bind(this)}
            id='command-line-input' type='text'
          />

      </HotKeys>
    )
  }
}
