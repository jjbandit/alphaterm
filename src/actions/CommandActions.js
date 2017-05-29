import AppDispatcher from '../dispatcher/AppDispatcher';
import CommandConstants from '../constants/CommandConstants';

export default class CommandActions {

  static create (cmd) {
    AppDispatcher.dispatch({
      action: CommandConstants.CREATE,
      data: cmd
    });
  }

  static update (cmd) {
    AppDispatcher.dispatch({
      action: CommandConstants.UPDATE,
      data: cmd
    });
  }

  static destroy (id) {
    AppDispatcher.dispatch({
      action: CommandConstants.DESTROY,
      data: id
    });
  }

  static clear() {
    AppDispatcher.dispatch({
      action: CommandConstants.CLEAR
    });
  }

}
