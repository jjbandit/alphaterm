
import Command from 'lib/classes/Command';

class AliasProvider {

  /*
   *  This returns a list of aliases
   */
  getTokens() {

    let command = new Command({
      root: 'alias',
      dir: '/'
    });

    let aliasTokens = [];

    let aliasCmd = command.exec();

    aliasCmd.stdout.on('data', (rawAliasString) => {
      let rawAliasArray = rawAliasString.split('\n');

      rawAliasArray.map( (rawAlias) => {
        let aliasSplit = rawAlias.split('=');
        let alias = aliasSplit[0];
        let cmd = aliasSplit[1];

        aliasTokens.push(alias);
      });  // end map
    });

    return new Promise( (fulfill, reject) => {

      aliasCmd.on('close', (code) => {
        if ( code === 0 ) {
          fulfill(aliasTokens);
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
