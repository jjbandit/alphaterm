let ReactDOM = require('react-dom');

/*
 *  This class initializes a container for React components to render into.
 *  To use it simply extend it and on every instantiation a container
 *  with the ID of the extended class' name.
 */
class AlphaComponent {

  constructor (props) {

    // Insert container elements for the React Component to render in
    let c = Object.getPrototypeOf(this).constructor.name;
    $('<div id="' + c + '">').insertAfter("#output");

  }
}
