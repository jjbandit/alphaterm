class CommandArea extends React.Component {

  constructor (props) {
    super(props);

    this.refreshContents();
  }

  refreshContents() {
    let opts = {};
    opts.cwd = this._cwd;

    // this._line.runCmd('ls', [], opts, this._line.appendToCwdContents )
  }

  appendToCwdContents(html){
    let jade = require('jade');
    let context = $("#cwd_contents");

    // let html = jade.renderFile('views/term-data.jade', { resp: resp });

    context.html(html);
  }

  render () {
    return(
      <div>
        <CommandLine />
      </div>
    );
  }

}
