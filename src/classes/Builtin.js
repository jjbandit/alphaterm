import AppState from 'lib/stores/AppStateStore';

class Builtin {

  cd (dir) {
    let _cwd = '',
        path = require('path');

    // If we pass in an absolute path set cwd to it, otherwise
    // resolve the cwd based on the relative path.
    if (dir) {
       path.isAbsolute(dir) ?
        _cwd = dir :
        _cwd = path.join(this.state.cwd, dir);
    }

    this.setState({
      cwd: _cwd
    });
  }
}

let x = new Builtin();
export default x;
