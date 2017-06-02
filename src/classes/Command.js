import Child from 'child_process';

import CommandActions from '../actions/CommandActions';

export default class Command {

  constructor(cmd, dir = '/') {

    if (typeof cmd === 'object') {
      Object.assign(this, cmd);
    }

    else if (typeof cmd === 'string') {
      this._cmd = cmd.split(' ');

      this.root = this._cmd[0];
      this.args = this._cmd.slice(1);

      this.dir = dir;
      this.data = [];
    }


  }

  /*
   *  This spawns a process directly.  Since this does not
   *  execute through a shell it does not have access to
   *  shell aliases.  It does however return streams that
   *  do not have a static size, which makes it ideal for
   *  commands that return large amounts of data.
   */
  spawn() {
    console.log("spawning", this.root, this.args);
    return Child.spawn(this.root, this.args, {cwd: this.dir});
  }

  /*
   *  This executes a command through the specified shell.
   *  Since it executes through a shell, commands have access
   *  to shell aliases.
   *
   *  It should be noted that exec has a static buffer size,
   *  default 200*1024 bytes, and should not be used for
   *  commands that expect large amounts of output.
   *
   *  Requires properties root and dir to be set.
   */
  exec() {
    let opts = {
      cwd: this.dir,
      shell: process.env.SHELL
    }

    if ( process.title.indexOf('cygwin') ) {
      opts.shell = 'C:/tools/cygwin/bin/bash.exe'
    }

    console.log("exec-ing", this.root, this.args, opts);
    return Child.execFile(this.root, opts);
  }

  appendData(newData) {
    newData.map( data => this.data.push(data) );
    CommandActions.update(this);
  }
}
