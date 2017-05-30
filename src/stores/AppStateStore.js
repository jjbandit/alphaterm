import AppDispatcher from '../dispatcher/AppDispatcher';

import Dexie from 'dexie';
import Store from '../stores/Store';

import InterfaceActionsConstants from '../constants/InterfaceActionConstants';

class AppStateStore extends Store {

  constructor(props) {
    super(props);

    this.registerWithDispatcher();
  }

  focusCommandLine() {
    document.getElementById("command-line-input").focus();
  }

  registerWithDispatcher(payload) {

    AppDispatcher.register( (payload) => {

      switch(payload.action) {

        case InterfaceActionsConstants.FOCUS_COMMAND_LINE:
          this.focusCommandLine();
          break;
      }

    });

  }
}

let x = new AppStateStore();
export default x;
