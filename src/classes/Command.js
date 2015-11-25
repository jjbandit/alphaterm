import CommandActions from 'lib/actions/CommandActions';

export default class Command {

  exit;

  constructor(cmd, dir) {

    if (typeof cmd === 'object') {
      Object.assign(this, cmd);
    }

    else if (typeof cmd === 'string') {
      let _cmd = cmd.split(' ');

      this.root = _cmd[0];
      this.args = _cmd.slice(1);

      this.dir = dir;
    }
  }

  run(callback) {

    let opts = {};
    opts.cwd = this.dir;

    /*
    * Spawn the command process
    */
    let path = require('path');
    let spawn = require('child_process').spawn;
    let child = spawn(this.root, this.args, opts);

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
        callback(resp);

      } else {
        this.updateCommandData(resp);
      }
    });

    child.on('close', (code) => {
      let _status;

      if (code !== 0) {
        _status = `Error: Exit ${code}`
      } else {
        _status = '\u{2713}'
      }

      this.exit = _status ;

      CommandActions.update(this);
    });

    child.on('error', (err) => {
      this.updateCommandData([err.stack]);
    });
  }

  updateCommandData(newData) {
    // Initialize data if it hasn't been initialized
    // This is nessicary to append multiple data repsonses
    this.data = this.data ? this.data : [] ;

    newData.map( (data) => {
      this.data.push(data);
    })

    CommandActions.update(this);
  }

}
