import Child from 'child_process';

import CommandActions from 'lib/actions/CommandActions';

export default class Command {

  exit;

  constructor(cmd, dir = '/') {

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

  spawn(callback) {

    let opts = {},
        child
    ;

    opts.cwd = this.dir;
    opts.shell = process.env.SHELL;

    child = Child.spawn(this.root, this.args, opts);

    child.stdout.on('data', (buffer) => {
      let _resp = this.splitBufferOn(buffer, 10);
      callback ? callback(_resp) : this.updateCommandData(_resp) ;
    });

    child.on('close', (code) => {
      let _status
      ;

      // Set exit to unicode checkmark if the command was successful
      // Signal error otherwise
      if (code === 0) {
        _status = '\u{2713}'

      } else {
        _status = `Error: Exit ${code}`
      }

      this.exit = _status ;

      if (!callback) {
        CommandActions.update(this);
      }
    });

    child.stderr.on('data', (data) => {
      console.log(data.toString());
    });

    child.on('error', (err) => {
      if (callback){
        callback(err);
      } else {
        this.updateCommandData([err.stack]);
      }
    });
  }

  /*
   *  Splits a buffer on a delimeter.
   */
  splitBufferOn(buffer, delim) {
    let resp = [];
    let lastEOL = 0;

    // This splits the buffer into an array, resp[], with indicies for each
    // newline character in the buffer
    for (let i = 0; i < buffer.length; i++) {

      if (buffer[i] === delim) {
        let val = buffer.slice(lastEOL, i).toString();
        resp.push(val);
        // adding 1 to i makes sure the newline char doesn't
        // make it into the output
        lastEOL = i + 1;
      }
    }

    return resp;
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

  /*
   *  Requires properties root and dir to be set.
   */
  exec() {

    let opts = {
      cwd: this.dir,
      shell: process.env.SHELL
    };

    return Child.exec(this.root, opts);

  }

}
