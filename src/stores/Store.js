import EventEmitter from 'events';

export default class Store extends EventEmitter {

  constructor (props) {
    super(props);
    this.CHANGE_EVENT = 'default_store_change';
  }

  emitChange () {
    this.emit(this.CHANGE_EVENT);
  }

  addChangeListener (callback) {
    this.on(this.CHANGE_EVENT, callback);
  }

  removeChangeListener (callback) {
    this.removeListener(this.CHANGE_EVENT, callback);
  }
}
