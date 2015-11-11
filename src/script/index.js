window.$ = window.jQuery = require('jquery');

$(document).ready( function () {
  ReactDOM.render( <AlphaTerm />, document.getElementById('alpha-term') );
});
