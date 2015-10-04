class CommandArea extends CommandLine {

  line;

  constructor () {
    super();

    this.line = new CommandLine();

    this.refreshContents();
  }

  refreshContents() {
    var opts = {
      cwd: this._cwd
    }
    this.line.runCmd('ls', [], opts, this.appendToCwdContents )
  }

  appendToCwdContents(html, context){
    var context = $("#cwd_contents");

    // HORRIBLE hack to get working with ES6
    // This function gets passed as a callback to runCmd and handles
    // the html nodes it returns.  Unfortunately that means that this runs
    // with a different lexical this as the class.
    let l = new CommandLine();
    html = l.buildOutput(html, context, 'span');

    context.html(html);
  }

}
