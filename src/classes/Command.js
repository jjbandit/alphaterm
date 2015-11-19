export default class Command {

  root; args; dir;

  constructor (cmdString, dir) {
    let _cmd = cmdString.split(' ');

    this.root = _cmd[0];
    this.args = _cmd.slice(1);

    this.dir = dir;
  }
}
