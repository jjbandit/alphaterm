import AppDispatcher from 'lib/dispatcher/AppDispatcher';
import EventEmitter from 'events';
import Dexie from 'dexie';

class CommandStore extends EventEmitter {

  CHANGE_EVENT;
  db;

  constructor (props) {
    super(props);

    this.CHANGE_EVENT = 'command-change';

    this.db = new Dexie('AlphaDB');

    this.db.version(1)
      .stores({
        commands: '++id, root, args, dir'
      });

    this.db.open().catch( (err) => {
      console.error(err);
    });
  }

  getAll () {
    return this.db.commands.toArray();
  }

  create (root, args, dir) {
    this.db.commands.add({
      // New es6 syntax for root: root .. etc
      root, args, dir
    });

    this.emitChange();
  }

  destroy (id) {
    this.db.commands.delete(id);
    this.emitChange();
  }

  clear () {
    this.db.commands.toCollection().delete();
    this.emitChange();
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

  /*
   *  Cache the registration token of this classes actions
   */
  dispatcherIndex (payload) {

    AppDispatcher.register( (payload) => {

      console.log('dispatcher');

      let action = payload.action;
      let text;
      switch(action.actionType) {
        case 'create':
          text = action.text.trim();
          if (text !== '') {
            create(text);
            this.emitChange();
          }
          break;

        // ETC .. ..
        //
        // case TodoConstants.TODO_DESTROY:
        //   destroy(action.id);
        //   TodoStore.emitChange();
        //   break;
      }
      return true; // No errors. Needed by promise in Dispatcher.
    })
  }

}

let c = new CommandStore();
module.exports = c;
