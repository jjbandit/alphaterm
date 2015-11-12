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
        commands: '++id, root, args'
      });

    this.db.open().catch( (err) => {
      console.error(err);
    });

    this

  }

  getAll () {
    return this.db.commands.toArray().then ( (commands) => {
      return commands;
    });
  }

  create (root, args) {
    console.log('create');

    this.db.commands.add({
      root: root,
      args: args
    });

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

      var action = payload.action;
      var text;
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
