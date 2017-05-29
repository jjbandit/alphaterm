import React from 'react';

import AliasProvider from '../completionProviders/Alias';
import PathProvider from '../completionProviders/Path';
import DirProvider from '../completionProviders/Dir';
import BuiltinProvider from '../completionProviders/Builtin';

import {HotKeys} from 'react-hotkeys';
import ReactDOM from 'react-dom';

import * as Fuzz from 'fuzzaldrin';

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

  /*
   *  Resets component to its initial blank state.
   */
  reset() {
    let currentDirTokens = Object.keys(this.state.dirTokens);
    this.setState({ selected: -1, completions: [], commandTokens: [], currentDirTokens });
  }

  /* Initialize $PATH tokenization ASAP.
   *
   * TODO: This takes a long time and should
   * have some visual cues for started/ended
   */
  componentDidMount() {

    AliasProvider.getTokens()
      .then( aliasTokens =>  this.setState({aliasTokens}) )
      .catch( error => console.error("Couldn't get alias tokens :(", error) );

    // This class is still incomplete
    BuiltinProvider.getTokens();

    PathProvider.getTokens().then( (pathTokens) => {
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

    let completionToken = this.state.completions[selected];

    let currentToken = commandTokens[commandTokens.length - 1];

    let tokenizedFilePath = this.tokenizePath(currentToken);

    // If we're dealing with a path, update the completion token to reflect
    // the new path
    if ( tokenizedFilePath.length > 1 ) {
      tokenizedFilePath[tokenizedFilePath.length - 1] = completionToken;

      completionToken = tokenizedFilePath.join('/');

      // It is nessicary ot manually call this because the
      // updateCompletionTokens (onChange handler) does not fire on the
      // components input field when we update its value programatically.
      this.updateDirTokens(tokenizedFilePath);
    }

    commandTokens[commandTokens.length - 1] = completionToken;

    this.setState({
      selected,
      commandTokens
    });
  }

  /*
   *  This sets the widgets completion list and manages the command inputs value.
   *  It is bound to trigger when the text input field changes.
   *
   *  The function retrieves the value of the most recent token, checks if it
   *  is a filepath, and if it is restricts the completions to files relevent
   *  in the context of the current token.
   */
  updateCompletionTokens(evt) {

    let commandTokens = evt.target.value.split(' ');

    let token = commandTokens[commandTokens.length - 1];

    let tokenizedFilePath = this.tokenizePath(token);

    this.updateDirTokens(tokenizedFilePath);

    let completions;

    // If tokenizedFilePath.length is greater than 1 then we are dealing with
    // a valid path token.
    if ( tokenizedFilePath.length > 1 ) {
      completions = this.state.currentDirTokens;
      completions = Fuzz.filter(completions, tokenizedFilePath[tokenizedFilePath.length -1], { maxResults: 10 });

    } else {
      completions = this.getCompletions(token);
      completions = Fuzz.filter(completions, token, { maxResults: 10 });
    }

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
   *  Returns an array with values for each path segment
   *
   *  @return {array} - The tokenized path
   */
  tokenizePath(token) {
    let tokenizedPath = token.split('/');

    return tokenizedPath
  }

  /*
   *  This function maintains the token tree for contextual directory
   *  completions.  It does so by first checking if the current path is
   *  present in the the state directory tokens tree.  If it is present,
   *  we fetch the completion tokens for that directory and insert them into
   *  the state.dirTokens tree, at the same time caching them in the
   *  currentDirTokens state object to be displayed to the user.
   *
   *  @param {array} tokenizedPath - The relative tokenized path to the directory
   *  we're trying to get completions for.
   */
  updateDirTokens(tokenizedPath) {
    let dirToken = tokenizedPath[ tokenizedPath.length - 1 ];
    let stateDirTokens = this.state.dirTokens;

    if ( this.stateDirTokensContainsPath(tokenizedPath) ) {

      let absoluteFilePathToCurrentToken = `${this.props.cwd}/${tokenizedPath.join('/')}`;

      DirProvider.getTokens(absoluteFilePathToCurrentToken).then( currentDirTokens => {

        let pathObject = this.createNewTokenizedPathObject(tokenizedPath, currentDirTokens);

        // Note that assign also modifies stateDirTokens.  I have assigned it to
        // dirTokens as well for the sake of brevity in the setState call below.
        let dirTokens = Object.assign(stateDirTokens, pathObject);

        this.setState({ dirTokens, currentDirTokens });

      });
    }
  }

  /*
   *  This function creates a nested object representing a file path, and
   *  assigns the final leaf in the tree the value of finalDirectoryTokenObject
   *
   *  @param {array} tokenizedPath - An array containing tokens for each
   *  directory in the file path to be represented.
   *
   *  @param {object} finalDirectoryTokenObject - An object containing props
   *  for each file contained in the last directory in tokenizedPath.  This
   *  object can be created with getTokenObject from an array.
   *
   *  @return {object} - File path-like object.
   */
  createNewTokenizedPathObject(tokenizedPath, finalDirectoryTokenObject = {}) {

    var object = {};
    var o = object;

    let tokenizedPathLength = tokenizedPath.length;

    for (let i=0; i < tokenizedPathLength; i++ ) {
      let key = tokenizedPath[i];

      o[key] = {};

      if ( i === tokenizedPathLength - 1 ) {
        let dirO = this.getTokenObject(finalDirectoryTokenObject);
        o[key] = dirO;
      }

      o = o[key];

    }

    return object;
  }

  /*
   *  This returns an object with properties for each index in the tokens param.
   *
   *  @param {array} tokens - An array of tokens to convert to an object.
   *
   *  @return {object} - Object containing properties corresponding to each
   *  input value in the tokens param.  Each property contains an empty object.
   */
  getTokenObject(tokens) {
    let tokenObj = {};

    tokens.map( token => {
      tokenObj[token] = {};
    });

    return tokenObj;
  }

  /*
   *  Recursive function to walk down the current state.dirTokens tree to see
   *  if it contains an arbitrary path.
   *
   *  @param {object} dirTokens - The path to walk.
   *
   *  @param {object} stateDirTokens - The full tree, or the portion not
   *  traversed so far.
   */
  stateDirTokensContainsPath(dirTokens, stateDirTokens = this.state.dirTokens ) {

    // We have to clone the dirTokens object so that it does not mutilate the
    // original object passed in
    let dt = Object.create(dirTokens);
    let dirToken = dt[0];


    if ( stateDirTokens[dirToken] ) {

      if (dt.length === 1) {
        return true;
      }

      dt.splice(0, 1);

      return this.stateDirTokensContainsPath(dt, stateDirTokens[dirToken]);
    }

    return false

  }

  /*
   *  Update dirTokens when the parent passes in a new cwd property.
   */
  componentWillReceiveProps(props) {

    // If we've changed directory then update dirTokens
    if (props.cwd !== this.props.cwd) {
      DirProvider.getTokens(props.cwd).then( (dirTokensArray) => {

        // Convert the dirTokens array to an object.
        let dirTokens = this.getTokenObject(dirTokensArray);

        this.setState({
          dirTokens,
          currentDirTokens: dirTokensArray
        });
      });
    }
  }

  /*
   * Returns a list of autocomplete objects from state.*Tokens
   * that gets filtered on token
   *
   * @param {string} token - Filter state tokens on this arg.
   *
   * @return {array} - The filtered tokens.
   */
  getCompletions(token) {
    let completions = [];
    let candidates = [];

    // Return no completions if token is empty
    if ( token === '' ) { return completions }

    candidates = candidates.concat(
      this.state.currentDirTokens,
      this.state.pathTokens,
      this.state.aliasTokens
    );

    return candidates;
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
            onChange={this.updateCompletionTokens.bind(this)}
            id='command-line-input' type='text'
          />

      </HotKeys>
    )
  }
}
