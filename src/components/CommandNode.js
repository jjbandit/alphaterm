class CommandNode extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data: []
    }
  }

  componentDidMount() {
    this.runCmd(this.props.command);
  }

  render () {
    return (
      <div>
        {
          this.state.data.map( (d) => {
            return ( <p>{d}</p> )
          })
        }
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

    opts.cwd = cmd.cwd;

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
        let _dataState = this.state.data;

        resp.map( (r) => {
          _dataState.push(r);
        });

        this.setState({ data: _dataState });
      }
    });

    child.stderr.on('data', (buffer) => {
      resp.push(buffer.toString());
    });

    child.on('close', (code) => {
      // TODO Update GUI to reflect the commands exit status.. or something to let the
      // user know how things went
    });
  }
}
