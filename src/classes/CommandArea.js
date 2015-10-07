class CommandArea extends CommandLine {

  constructor () {
    super();
    this.refreshContents();
  }

  intercept (cmd, args, opts, callback) {
    let ret = super.intercept(cmd, args, opts, this.refreshContents);

    this.refreshContents();

    return ret;
  }

  refreshContents() {
    let opts = {};
    opts.cwd = this._cwd;

    this.runCmd('ls', [], opts, this.appendToCwdContents )
  }

  appendToCwdContents(resp){
    let jade = require('jade');
    let context = $("#cwd_contents");

    let html = jade.renderFile('views/term-data.jade', { resp: resp });

    context.html(html);
  }

}
