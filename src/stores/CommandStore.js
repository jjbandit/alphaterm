import AppDispatcher from '../dispatcher/AppDispatcher';
import Dexie from 'dexie';

import Command from '../classes/Command';
import CommandConstants from '../constants/CommandConstants';
import Store from '../stores/Store';

class CommandStore extends Store {

  constructor (props) {
    super(props);

    this.CHANGE_EVENT = 'command-change';

    this.db = new Dexie('AlphaDB');

    this.db.version(1)
      .stores({
        commands: '++id, root, args, dir, data, exit'
      });

    this.db.open().catch( (err) => {
      console.error(err);
    });

    this.registerWithDispatcher();
  }

  getAll() {
    return this.db.commands.toArray( (commands) => {
      let commandList = [];

      commands.map( (command) => {
        commandList.push(new Command(command));
      });

      return commandList;
    });
  }

  create (cmd) {
    this.db.commands.add(cmd);

    this.emitChange();
  }

  update(cmd) {
    this.db.commands.put(cmd);
    this.emitChange();
  }

  destroy(id) {
    this.db.commands.delete(id);
    this.emitChange();
  }

  clear() {
    this.db.commands.toCollection().delete();
    this.emitChange();
  }

  emitChange() {
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
  registerWithDispatcher(payload) {

    AppDispatcher.register( (payload) => {

      let action = payload.action;
      let data = payload.data;

      switch(action) {

        case CommandConstants.CREATE:
          // console.log('create');
          this.create(data);
          break;

        case CommandConstants.UPDATE:
          // console.log('update');
          this.update(data);
          break;

        case CommandConstants.DESTROY:
          // console.log('destroy');
          this.destroy(data);
          break;

        case CommandConstants.CLEAR:
          // console.log('clear');
          this.clear();
          break;

      }
      return true; // No errors. Needed by promise in Dispatcher.
    })
  }

}

let x = new CommandStore();
 export default x;
