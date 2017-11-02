'use strict';

import { NotFoundError } from './common/page';
import Login from './login/login';
import Create from './create/create';
import Details from './details/details';
import Find from './find/find';
import My from './my/my';
import Profile from './profile/profile';
import Settings from './settings/settings';
import { getLoggedInUserId } from './common/utils';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory, IndexRoute } from 'react-router'

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let nav;
    if (!getLoggedInUserId()) {
      nav = (
        <span className="nav">
          <a href="/">Find Events</a>
          <a href="/login">Log in or Sign up</a>
        </span>
      );
    } else {
      nav = (
        <span className="nav">
          <a href="/">Find Events</a>
          <a href="/create">Create Events</a>
          <a href="/my">My Events</a>
          <a href="/settings">Settings</a>
        </span>
      );
    }
    return (
      <div>
        <div className="header"><div>
          <a href="/" className="logo">eventure</a>
          {nav}
        </div></div>
        <div className="content">
          {this.props.children}
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Find}/>
      <Route path="/login" component={Login} />
      <Route path="/create" component={Create} />
      <Route path="/my" component={My} />
      <Route path="/event/:id" component={Details} />
      <Route path="/settings" component={Settings} />
      <Route path="/profile/:id" component={Profile} />
      {/* Add more routes here */}
      <Route path="*" component={NotFoundError} />
    </Route>
  </Router>,
  document.getElementById('react')
);
