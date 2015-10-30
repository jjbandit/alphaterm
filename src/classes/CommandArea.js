let ReactDOM = require('react-dom');

class CommandArea {

  _line;

  constructor (props) {
    console.log('Area constructor');

    this._line = new CommandLine();

    ReactDOM.render(<CommandAreaComponent />, document.getElementById('output'));

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

    this._line.runCmd('ls', [], opts, this._line.appendToCwdContents )
  }

  appendToCwdContents(html){
    let jade = require('jade');
    let context = $("#cwd_contents");
    // console.log(resp);

    // let html = jade.renderFile('views/term-data.jade', { resp: resp });

    context.html(html);
  }

}
