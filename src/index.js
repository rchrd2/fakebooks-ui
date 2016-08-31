import React from 'react';
import ReactDOM from 'react-dom';
// import { hashHistory } from 'react-router';
import Routes from './routes';

import { useRouterHistory } from 'react-router'
import { createHashHistory } from 'history'
var customHistory = useRouterHistory(createHashHistory)({ queryKey: false });

import './index.css';

ReactDOM.render(
  <Routes history={customHistory} />,
  document.getElementById('root')
);
