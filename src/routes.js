// src/routes.js
import React from 'react';
import { Router, Route /* , IndexRoute */ } from 'react-router';

import App from './App.js';
// import Layout from './layout.js';
// import Toc from './toc.js';

// import About from './components/About';
// import NotFound from './components/NotFound';


const Routes = (props) => (
  <Router {...props}>
    <Route path="/(:identifer(/:titleSlug))" component={App}/>
    {/*<IndexRoute component={App} />*/}
    {/*
    <Route path="/" component={Layout}>
      <Route path="/about" component={About} />
      <Route path="*" component={NotFound} />
    </Route>
    */}
  </Router>
);



export default Routes;
