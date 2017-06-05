import AppDispatcher from '../dispatcher/AppDispatcher';
import InterfaceActionConstants from '../constants/InterfaceActionConstants';

export default class InterfaceActions {

  static Redirect(To) {
    AppDispatcher.dispatch({
      action: InterfaceActionConstants.REDIRECT,
      data: To

    });
  }

  static focusCommandLine () {
    AppDispatcher.dispatch({
      action: InterfaceActionConstants.FOCUS_COMMAND_LINE
    });
  }

}
