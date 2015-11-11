let React = require('react');
let ReactDOM = require('react-dom');

/*
 * This is the main Flux "Controller-View" and the primary entry point for
 * data into the application.
 */
class AlphaTerm extends React.Component {

  constructor (props) {
    super(props);

  }

  render () {
    return (
      <div>
        <CommandArea />
      </div>
    )
  }
}
