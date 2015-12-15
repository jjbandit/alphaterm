/*
 *  This class is meant to be instantiated in any other class that may want to
 *  make use of shell builtin commands.
 *
 *  To use this class you first create a new instance using `new Builtin()`
 *
 *  You may then register handlers that receive the values returned by their
 *  respective builtin functions.
 *
 *  Calling builtin functions may be done by passing the Builtin.run() function
 *  a well formed Command object.
 */
export default class Builtin {

  constructor() {
    this.handlers = {};
  }

  /*
   *  Register a handler for a builtin function
   *
   *  @param {string} args.builtin - The name of the builtin to bind to
   *
   *  @param {closure} args.handler - The closure that will receive the return
   *  value when the builtin returns.
   *
   *  @param {object} args.context - The context that will be bound to the
   *  `this` keyword inside args.handler.  Useful should you need to preserve
   *  the React component as `this`
   *
   */
  registerHandler(args = { context: {} }) {
    this.handlers[args.builtin] = args.handler.bind(args.context);
  }

  /*
   *  Execute an arbitrary function in this classes prototype, if it exists.
   *
   *  @return {boolean} - True if this class contains the function, false otherwise.
   */
  run(command) {
    // If this objects prototype has a property that matches the command
    if (Object.getPrototypeOf(this).hasOwnProperty(command.root) ) {

      // Fire that property as a function
      this[command.root](command);
      return true
    }

    return false
  }

  /*
   *  Builtin that implements the POSIX cd command.
   */
  cd(command) {
    let _cwd = '',
        path = require('path');

    // If we pass in an absolute path set cwd to it, otherwise
    // resolve the cwd based on the relative path.
    if ( command.args ) {
       path.isAbsolute(command.args[0]) ?
        _cwd = command.args[0] :
        _cwd = path.join(command.dir, command.args[0]);
    }

    this.handlers.cd(_cwd);
  }
}
