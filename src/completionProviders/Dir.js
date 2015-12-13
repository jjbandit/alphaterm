import fs from 'fs';

class DirProvider {

  /*
   * Sets the state.dirTokens to an array with indicies
   * for each file in dir
   *
   * @param {string} dir - Directory to index
   */
  getTokens(dir) {
    return new Promise( (fulfill, reject) => {

      fs.readdir(dir, (err, dirTokens) => {
        if (err) {
          reject(err);
        } else {
          fulfill(dirTokens);
        }
      });
    });
  }
}

let x = new DirProvider();
export default x;
