import Dexie from 'dexie';
import Store from '../stores/Store';

class AppStateStore extends Store {

  constructor(props) {
    super(props);

    this.registerWithDispatcher();
  }

  setCWD(dir) {
  }

  registerWithDispatcher() {
  }
}

let x = new AppStateStore();
export default x;
