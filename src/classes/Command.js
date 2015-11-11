class Command {

  root; args; cwd;

  constructor (cmdString, cwd) {
      let _cmd = cmdString.split(' ');

      this.root = _cmd[0];
      this.args = _cmd.slice(1);

      this.cwd = cwd;
  }
}
