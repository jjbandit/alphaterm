class CommandNode extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data: [],
      status: 'running'
    }
  }

  componentDidMount() {
    this.runCmd(this.props.command);
  }

  render () {
    return (
      <div className="command-node">
        <p className="command-node-info">
          <span>{this.state.status}</span>
          <span>{this.props.command.root}</span>
          <span>{this.props.command.args}</span>
          <span>{this.props.command.dir}</span>
        </p>
        <p className="command-node-data">
          {this.state.data}
        </p>
      </div>
    )
  }

  runCmd (cmd, opts, callback) {
    /*
    * If we pass in a callback, skip all the default handling and pass the
    * stdout data to the callback, otherwise use the default behavor and set
    * the Component state.data
    */

    typeof(args) === 'function' ? ( callback = args, args = [] ) : null ;
    typeof(opts) === 'function' ? ( callback = opts, opts = {} ) : null ;

    opts = opts ? opts : {} ;

    opts.cwd = cmd.dir;

    /*
    * Spawn the command process
    */
    let path = require('path');
    let spawn = require('child_process').spawn;
    let child = spawn(cmd.root, cmd.args, opts);

    child.stdout.on('data', (buffer) => {
      let resp = [];
      let lastEOL = 0;

      // This splits the buffer into an array, resp[], with indicies for each
      // newline character in the buffer
      for (let i = 0; i < buffer.length; i++) {

        if (buffer[i] === 10) {
          let val = buffer.slice(lastEOL, i).toString();
          resp.push(val);
          // adding 1 to i makes sure the newline char doesn't
          // make it into the output
          lastEOL = i + 1;
        }
      }

      if (callback){
        callback(resp, context);

      } else {
        this._updateDataState(resp);
      }
    });

    child.on('close', (code) => {
      let _status;

      if (code !== 0) {
        _status = `Error: Exit ${code}`
      } else {
        _status = '\u{2713}'
      }

      this.setState({
        status: _status
      });
    });

    child.on('error', (err) => {
      this._updateDataState(err.stack);

      this.setState({
        status: 'error'
      });
    });
  }

  _updateDataState (newData) {
    // Wrap data in an array for consistency
    if ( typeof newData !== Array ) {
      newData = [newData] ;
    }

    let _dataState = this.state.data;
    newData.map( (r) => {
      _dataState.push(r);
    });

    this.setState({ data: _dataState });
  }
}
