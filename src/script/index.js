window.$ = window.jQuery = require('jquery');
import ReactDOM from 'react-dom';
import React from 'react';
import AlphaTerm from 'lib/components/AlphaTerm';

$(document).ready( function () {
  ReactDOM.render( <AlphaTerm />, document.getElementById('alpha-term') );
});
