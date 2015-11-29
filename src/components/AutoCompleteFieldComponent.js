import React from 'react';

import AliasProvider from 'lib/completionProviders/Alias';
import PathProvider from 'lib/completionProviders/Path';
import DirProvider from 'lib/completionProviders/Dir';
import BuiltinProvider from 'lib/completionProviders/Builtin';

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

  reset() {
    this.setState({ selected: -1, completions: [], commandTokens: [] });
  }

  /* Initialize $PATH tokenization ASAP.
   *
   * TODO: This takes a long time and should
   * have some visual cues for started/ended
   */
  componentDidMount() {

    AliasProvider.getTokens().then( (aliasTokens) => {
      this.setState({aliasTokens});
    });

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
      DirProvider.getTokens(props.cwd).then( (dirTokens) => {
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

    const candidates = this.state.pathTokens.concat(this.state.dirTokens, this.state.aliasTokens);
    completions = Fuzz.filter(candidates, token, { maxResults: 10 });

    return completions;
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
