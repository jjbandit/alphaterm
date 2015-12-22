
/*
 *  This class is a bit of a mis-nomer in the sense that it not only provides
 *  Alias completion tokens, but also maintains an internal mapping of those
 *  aliases command objects.
 *
 *  This behavior should likely be modified/separated in the future.
 */
import Command from 'lib/classes/Command';

class AliasProvider {

  /*
   * Maintain an internal mapping of alias->Command objects
   */
  aliasCommands;

  aliasTokens;

  constructor() {
    this.aliasCommands = [];
    this.aliasTokens = [];
  }

  /*
   *  Returns the command object corresponding to the supplied alias,
   *  or false if a match could not be found.
   */
  getCommand(alias) {

    let numCommands = this.aliasCommands.length;

    for (let i=0; i < numCommands; i++) {
      let command = this.aliasCommands[i];

      // Command.alias is set in this.getTokens() when the aliases are indexed
      if ( command.alias === alias) return command;
    }

    return false;
  }

  /*
   *  This returns a list of aliases and populates the this.aliasCommands
   *  and this.aliasTokens arrays.
   */
  getTokens() {

    let command = new Command({
      root: 'alias',
      dir: '/'
    });

    let aliasCmd = command.exec();

    aliasCmd.stdout.on('data', (rawAliasString) => {

      let rawAliasArray = rawAliasString.split('\n');

      // Pop last element because Array.split will create
      // an empty index when it hits the final \n
      rawAliasArray.pop();

      rawAliasArray.map( (rawAlias) => {
        let aliasSplit = rawAlias.split('=');

        let alias = aliasSplit[0];

        let cmdString = aliasSplit[1];

        // Strip any quotes wrapping the command strings
        cmdString = cmdString.replace(/['"]$/, "");
        cmdString = cmdString.replace(/^['"]/, "");

        let command = new Command(cmdString);

        // Keep track of which alias this Command belongs to
        command.alias = alias;

        this.aliasCommands.push(command);
        this.aliasTokens.push(alias);
      });  // end map
    });

    return new Promise( (fulfill, reject) => {

      aliasCmd.on('close', (code) => {
        if ( code === 0 ) {
          fulfill(this.aliasTokens);
        }
      });

      aliasCmd.on('error', (err) => {
        reject(err);
      });

    }); // End Promise
  }
}


let x = new AliasProvider();
export default x;
