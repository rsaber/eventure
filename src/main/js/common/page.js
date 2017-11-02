'use strict';
import React from 'react';

// Common page containing UI needed in all pages.
export default class Page extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.error) {
      if (this.props.error.message === '404') {
        return <h1 className="centerText">Page not found!</h1>;
      } else if (this.props.error.message === '401') {
        return (
          <div className="centerText">
            <img id="lock" src="/images/icons/lock.svg" />
            <h2><b>Sorry!</b></h2>
            <h2>This page is only available for eventure members.</h2>
            <br />
            <h4>You can log in or sign up <a href="/login">here</a> to access this page.</h4>
          </div>
        );
      }
      return <h1 className="centerText">There was an error!</h1>;
    } else if (this.props.loading) {
      const Spinner = require('react-spinkit');
      return <Spinner className="centreSpinner" name="wandering-cubes" color="fuchsia"/>;
    }

    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

export class NotFoundError extends React.Component {
  render() {
    return <Page error={{ message: '404' }} />;
  }
}
