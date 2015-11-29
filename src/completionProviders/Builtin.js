
class BuiltinProvider {
  getTokens() {

    //
    // http://hyperpolyglot.org/unix-shells
    //
    switch (process.env.SHELL) {

      case "/bin/zsh":
        /*
         *  Get list of builtin commands from child_process.exec( enable ) ...
         */
        break;

      case "/bin/bash":
        /*
         *  Get list of builtin commands from child_process.exec( enable -n ) ...
         */
        break;

      case "/bin/fish":
        /*
         *  Get list of builtin commands from child_process.exec( builtin -n ) ...
         */
        break;

      default:
        break;
    }
  }
}

let x = new BuiltinProvider();
export default x;
