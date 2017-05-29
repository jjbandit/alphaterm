let $ = require('jquery');

import ReactDOM from 'react-dom';
import React from 'react';
import AlphaTerm from '../components/AlphaTerm';

$(document).ready( function () {
  ReactDOM.render( <AlphaTerm />, document.getElementById('alpha-term') );
});
