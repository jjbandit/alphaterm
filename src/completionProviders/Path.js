import walk from 'walk';
import executable from 'executable';

import Command from '../classes/Command';

class PathProvider {

  /*
   * Leverages the `walk` module to recursively retrieve
   * filepaths to files contained in $PATH directories
   *
   * Leverages the 'executable' module to check if each
   * file is executable, and if so adds it to the index
   * of files to return
   *
   * @return {Promise} - Fulfills with an array containing indicies
   * for each executable file in $PATH
   */
  getTokens() {
    const path = process.env.PATH.split(':');
    const pathLength = path.length; // Number of entries in $PATH

    let pathTokens = [];  // Array of tokens to eventually set in this.state
    let completed = 0;  // Keep track of how many walkers have ended

    return new Promise( (fulfill, reject) => {

      // Create a walk instance for each directory in $PATH
      path.map( (dir, i) => {
        let walker = walk.walk(dir);

        // When we encounter a file:
        // 1) check if it is executable
        // 2) push it into pathTokens[] if it is.
        walker.on('file', (root, fileStat, next) => {
          const filePath = `${root}/${fileStat.name}` ;

          // executable returns a falsy value in exec
          executable(filePath).then( exec => {
            if (exec) {
              pathTokens.push(fileStat.name);
            }
          });

          // Continue to next file
          next();
        });

        // Cache how many walkers have hit this event, and if all have ended then
        // fulfill the promise
        walker.on('end', () => {
          if ( ++completed === pathLength ) {
            fulfill(pathTokens);
          }
        });

        // Spit out errors to console.error and continue business as usual
        walker.on('errors', (root, errors, next) => {
          errors.map( e => {
            console.error(e.error);
          });
          next();
        });

      });  // End path.map loop
    });  // End Promise
  }
}


let x = new PathProvider();
export default x;
