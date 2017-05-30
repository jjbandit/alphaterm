import AppDispatcher from '../dispatcher/AppDispatcher';
import InterfaceActionConstants from '../constants/InterfaceActionConstants';

export default class InterfaceActions {

  static focusCommandLine () {
    AppDispatcher.dispatch({
      action: InterfaceActionConstants.FOCUS_COMMAND_LINE
    });
  }

}
